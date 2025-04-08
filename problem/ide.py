from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import time
import psutil
import json

app = FastAPI()

class CodeInput(BaseModel):
    code: str
    input_data: str = ""

@app.post("/run_code/")
async def run_code(code_input: CodeInput):
    code = code_input.code
    input_data = code_input.input_data

    # Lưu mã nguồn C vào file tạm
    code_filename = "/tmp/code.c"
    with open(code_filename, "w") as f:
        f.write(code) 

    # Biên dịch mã nguồn C
    compile_process = subprocess.run(
        ["gcc", code_filename, "-o", "/tmp/output"],
        capture_output=True, text=True
    )

    if compile_process.returncode != 0:
        raise HTTPException(status_code=400, detail=f"Error compiling code: {compile_process.stderr}")

    # Tạo process để chạy chương trình C
    start_time = time.time()  # Bắt đầu đo thời gian
    process = subprocess.Popen(
        ["/tmp/output"],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )

    # Đo bộ nhớ ngay từ khi tiến trình bắt đầu
    proc = psutil.Process(process.pid)
    memory_usage = proc.memory_info().rss // 1024  # Bộ nhớ sử dụng (RSS) tính bằng KB

    # Chạy chương trình và lấy output
    stdout, stderr = process.communicate(input=input_data.encode())   # Đo thời gian chạy
    elapsed_time = round(time.time() - start_time, 6)  # Đo thời gian chính xác

    if stderr:
        raise HTTPException(status_code=400, detail=f"Error running code: {stderr.decode()}")
    
    # Trả kết quả về client
    return {
        "output": stdout.decode(),
        "elapsed_time": elapsed_time,
        "memory_usage": memory_usage
    }

import sys
import subprocess
import tempfile
import os

def execute_python_code(user_code: str, test_cases: str, timeout: int = 5):
    full_script = f"{user_code}\n\n# Test Cases\n{test_cases}"
    
    with tempfile.TemporaryDirectory() as temp_dir:
        file_path = os.path.join(temp_dir, "solution.py")
        with open(file_path, "w") as f:
            f.write(full_script)
            
        try:
            # Docker-க்கு பதிலாக local Python environment-ல் run செய்யும் சுலபமான வழி
            result = subprocess.run(
                [sys.executable, file_path],
                capture_output=True,
                text=True,
                timeout=timeout
            )
            
            if result.returncode == 0:
                return {"status": "Success", "output": result.stdout}
            else:
                return {"status": "Runtime Error", "output": result.stderr}
                
        except subprocess.TimeoutExpired:
            return {"status": "Timeout", "output": "Execution timed out (Limit: 5 seconds)"}
        except Exception as e:
            return {"status": "Error", "output": str(e)}
#!/usr/bin/env python3
"""
DGA Qiyas Copilot - One-Click Setup and Run Script

This script automates the entire setup process:
1. Creates/activates virtual environment
2. Installs Python dependencies
3. Builds React frontend (if npm available)
4. Initializes database
5. Starts the FastAPI server

Usage:
    python setup_and_run.py
"""
import os
import sys
import subprocess
import platform
from pathlib import Path


class Colors:
    """ANSI color codes for terminal output"""
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'


def print_step(message):
    """Print a step message in blue"""
    print(f"\n{Colors.BLUE}{Colors.BOLD}📦 {message}{Colors.END}")


def print_success(message):
    """Print a success message in green"""
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")


def print_warning(message):
    """Print a warning message in yellow"""
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")


def print_error(message):
    """Print an error message in red"""
    print(f"{Colors.RED}❌ {message}{Colors.END}")


def get_python_executable():
    """Get the appropriate Python executable path"""
    if platform.system() == "Windows":
        return str(Path("venv") / "Scripts" / "python.exe")
    else:
        return str(Path("venv") / "bin" / "python")


def get_pip_executable():
    """Get the appropriate pip executable path"""
    if platform.system() == "Windows":
        return str(Path("venv") / "Scripts" / "pip.exe")
    else:
        return str(Path("venv") / "bin" / "pip")


def create_virtual_environment():
    """Create virtual environment if it doesn't exist"""
    print_step("Checking virtual environment...")

    venv_path = Path("venv")

    if venv_path.exists():
        print_success("Virtual environment already exists")
        return True

    print("Creating virtual environment...")
    try:
        subprocess.run(
            [sys.executable, "-m", "venv", "venv"],
            check=True,
            capture_output=True
        )
        print_success("Virtual environment created successfully")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"Failed to create virtual environment: {e}")
        return False


def install_python_dependencies():
    """Install Python dependencies from requirements.txt"""
    print_step("Installing Python dependencies...")

    pip_exec = get_pip_executable()
    requirements_file = Path("requirements.txt")

    if not requirements_file.exists():
        print_error("requirements.txt not found!")
        return False

    try:
        # Upgrade pip first
        print("Upgrading pip...")
        subprocess.run(
            [pip_exec, "install", "--upgrade", "pip"],
            check=True,
            capture_output=True
        )

        # Install requirements
        print("Installing packages (this may take a few minutes)...")
        subprocess.run(
            [pip_exec, "install", "-r", "requirements.txt"],
            check=True
        )
        print_success("Python dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"Failed to install dependencies: {e}")
        return False


def build_frontend():
    """Build React frontend if npm is available"""
    print_step("Checking frontend build...")

    frontend_dist = Path("frontend") / "dist"

    if frontend_dist.exists():
        print_success("Frontend already built")
        return True

    # Check if npm is available
    try:
        subprocess.run(
            ["npm", "--version"],
            check=True,
            capture_output=True
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        print_warning("npm not found. Skipping frontend build.")
        print_warning("Frontend will not be available. Install Node.js and run: cd frontend && npm install && npm run build")
        return True

    # Build frontend
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print_warning("Frontend directory not found. Skipping frontend build.")
        return True

    try:
        print("Installing frontend dependencies...")
        subprocess.run(
            ["npm", "install"],
            cwd=frontend_dir,
            check=True
        )

        print("Building frontend (this may take a minute)...")
        subprocess.run(
            ["npm", "run", "build"],
            cwd=frontend_dir,
            check=True
        )

        print_success("Frontend built successfully")
        return True
    except subprocess.CalledProcessError as e:
        print_warning(f"Frontend build failed: {e}")
        print_warning("Backend will still work, but frontend won't be available")
        return True


def create_data_directory():
    """Create data directory for SQLite database"""
    print_step("Creating data directory...")

    data_dir = Path("data")
    data_dir.mkdir(exist_ok=True)

    print_success("Data directory ready")
    return True


def create_gitignore():
    """Create .gitignore file if it doesn't exist"""
    gitignore_path = Path(".gitignore")

    if gitignore_path.exists():
        return

    gitignore_content = """# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/

# Database
*.db
data/

# Configuration (contains secrets)
config/settings.yaml

# Frontend
frontend/node_modules/
frontend/dist/
frontend/.vite/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
"""

    with open(gitignore_path, 'w') as f:
        f.write(gitignore_content)

    print_success("Created .gitignore file")


def start_server():
    """Start the FastAPI server"""
    print_step("Starting DGA Qiyas Copilot server...")

    python_exec = get_python_executable()

    print(f"\n{Colors.GREEN}{Colors.BOLD}")
    print("=" * 60)
    print("  🚀 DGA Qiyas Copilot Starting")
    print("=" * 60)
    print(f"{Colors.END}")
    print(f"\n{Colors.BOLD}Server URL:{Colors.END} http://localhost:8000")
    print(f"{Colors.BOLD}API Docs:{Colors.END} http://localhost:8000/api/docs")
    print(f"\n{Colors.YELLOW}Press Ctrl+C to stop the server{Colors.END}\n")

    try:
        subprocess.run(
            [
                python_exec, "-m", "uvicorn",
                "backend.main:app",
                "--host", "0.0.0.0",
                "--port", "8000",
                "--reload"
            ],
            check=True
        )
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}👋 Server stopped by user{Colors.END}")
    except subprocess.CalledProcessError as e:
        print_error(f"Server failed to start: {e}")
        return False

    return True


def main():
    """Main setup and run function"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}")
    print("=" * 60)
    print("  DGA Qiyas Copilot - Setup and Run")
    print("=" * 60)
    print(f"{Colors.END}\n")

    # Step 1: Create virtual environment
    if not create_virtual_environment():
        print_error("Setup failed: Could not create virtual environment")
        sys.exit(1)

    # Step 2: Install Python dependencies
    if not install_python_dependencies():
        print_error("Setup failed: Could not install Python dependencies")
        sys.exit(1)

    # Step 3: Build frontend
    build_frontend()  # Non-critical, continues even if it fails

    # Step 4: Create data directory
    if not create_data_directory():
        print_error("Setup failed: Could not create data directory")
        sys.exit(1)

    # Step 5: Create .gitignore
    create_gitignore()

    # Step 6: Start server
    print(f"\n{Colors.GREEN}{Colors.BOLD}✅ Setup complete!{Colors.END}\n")

    start_server()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}👋 Setup cancelled by user{Colors.END}")
        sys.exit(0)
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

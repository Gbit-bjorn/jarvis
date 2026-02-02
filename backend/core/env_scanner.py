"""
Environment Scanner
Detects installed development tools and their versions
"""

import asyncio
import subprocess
from typing import List, Dict, Optional
from pydantic import BaseModel


class ToolInfo(BaseModel):
    """Information about a detected tool"""
    name: str
    version_found: Optional[str] = None
    status: str  # 'found', 'missing', 'wrong_version'
    version_required: Optional[str] = None


async def run_command(command: List[str]) -> Optional[str]:
    """Run a command and return its output"""
    try:
        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await process.communicate()

        if process.returncode == 0:
            output = stdout.decode().strip()
            if not output and stderr:
                output = stderr.decode().strip()
            return output
        return None
    except (FileNotFoundError, PermissionError):
        return None


async def check_node() -> ToolInfo:
    """Check for Node.js installation"""
    version = await run_command(['node', '--version'])

    if version:
        return ToolInfo(name='Node.js', version_found=version, status='found')
    return ToolInfo(name='Node.js', status='missing')


async def check_npm() -> ToolInfo:
    """Check for npm installation"""
    version = await run_command(['npm', '--version'])

    if version:
        return ToolInfo(name='npm', version_found=version, status='found')
    return ToolInfo(name='npm', status='missing')


async def check_yarn() -> ToolInfo:
    """Check for Yarn installation"""
    version = await run_command(['yarn', '--version'])

    if version:
        return ToolInfo(name='Yarn', version_found=version, status='found')
    return ToolInfo(name='Yarn', status='missing')


async def check_pnpm() -> ToolInfo:
    """Check for pnpm installation"""
    version = await run_command(['pnpm', '--version'])

    if version:
        return ToolInfo(name='pnpm', version_found=version, status='found')
    return ToolInfo(name='pnpm', status='missing')


async def check_python() -> ToolInfo:
    """Check for Python installation"""
    # Try python3 first, then python
    version = await run_command(['python3', '--version'])

    if not version:
        version = await run_command(['python', '--version'])

    if version:
        return ToolInfo(name='Python', version_found=version, status='found')
    return ToolInfo(name='Python', status='missing')


async def check_pip() -> ToolInfo:
    """Check for pip installation"""
    version = await run_command(['pip', '--version'])

    if not version:
        version = await run_command(['pip3', '--version'])

    if version:
        return ToolInfo(name='pip', version_found=version, status='found')
    return ToolInfo(name='pip', status='missing')


async def check_php() -> ToolInfo:
    """Check for PHP installation"""
    version = await run_command(['php', '--version'])

    if version:
        # Extract version number (first line usually contains it)
        version_line = version.split('\n')[0]
        return ToolInfo(name='PHP', version_found=version_line, status='found')
    return ToolInfo(name='PHP', status='missing')


async def check_composer() -> ToolInfo:
    """Check for Composer installation"""
    version = await run_command(['composer', '--version'])

    if version:
        return ToolInfo(name='Composer', version_found=version.split('\n')[0], status='found')
    return ToolInfo(name='Composer', status='missing')


async def check_dotnet() -> ToolInfo:
    """Check for .NET SDK installation"""
    version = await run_command(['dotnet', '--version'])

    if version:
        return ToolInfo(name='.NET SDK', version_found=version, status='found')
    return ToolInfo(name='.NET SDK', status='missing')


async def check_java() -> ToolInfo:
    """Check for Java installation"""
    version = await run_command(['java', '--version'])

    if not version:
        version = await run_command(['java', '-version'])

    if version:
        # Extract version from output
        version_line = version.split('\n')[0]
        return ToolInfo(name='Java', version_found=version_line, status='found')
    return ToolInfo(name='Java', status='missing')


async def check_git() -> ToolInfo:
    """Check for Git installation"""
    version = await run_command(['git', '--version'])

    if version:
        return ToolInfo(name='Git', version_found=version, status='found')
    return ToolInfo(name='Git', status='missing')


async def check_git_config() -> Dict[str, Optional[str]]:
    """Check Git configuration"""
    name = await run_command(['git', 'config', 'user.name'])
    email = await run_command(['git', 'config', 'user.email'])

    return {
        'name': name,
        'email': email
    }


async def check_docker() -> ToolInfo:
    """Check for Docker installation and status"""
    version = await run_command(['docker', '--version'])

    if version:
        # Check if Docker daemon is running
        ps_output = await run_command(['docker', 'ps'])
        status = 'found' if ps_output is not None else 'found'

        return ToolInfo(name='Docker', version_found=version, status=status)
    return ToolInfo(name='Docker', status='missing')


async def check_go() -> ToolInfo:
    """Check for Go installation"""
    version = await run_command(['go', 'version'])

    if version:
        return ToolInfo(name='Go', version_found=version, status='found')
    return ToolInfo(name='Go', status='missing')


async def check_rust() -> ToolInfo:
    """Check for Rust installation"""
    version = await run_command(['rustc', '--version'])

    if version:
        return ToolInfo(name='Rust', version_found=version, status='found')
    return ToolInfo(name='Rust', status='missing')


async def check_cargo() -> ToolInfo:
    """Check for Cargo installation"""
    version = await run_command(['cargo', '--version'])

    if version:
        return ToolInfo(name='Cargo', version_found=version, status='found')
    return ToolInfo(name='Cargo', status='missing')


async def scan_environment() -> Dict[str, any]:
    """Scan the entire development environment"""
    # Run all checks concurrently
    results = await asyncio.gather(
        check_node(),
        check_npm(),
        check_yarn(),
        check_pnpm(),
        check_python(),
        check_pip(),
        check_php(),
        check_composer(),
        check_dotnet(),
        check_java(),
        check_git(),
        check_docker(),
        check_go(),
        check_rust(),
        check_cargo(),
    )

    # Get Git config separately
    git_config = await check_git_config()

    return {
        'tools': [tool.model_dump() for tool in results],
        'git_config': git_config,
        'scanned_at': asyncio.get_event_loop().time()
    }

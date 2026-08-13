#!/usr/bin/env python3
"""
Standalone runner for the Pytest DeepEval WhatsApp Agent Harness.
Equivalent to: pytest tests/test_agent.py -v -s
"""
import pytest
import sys
import os

if __name__ == "__main__":
    # Ensure current directory is in path
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    # Run pytest
    sys.exit(pytest.main([
        os.path.join(os.path.dirname(__file__), "test_agent.py"),
        "-v",
        "-s",
        "--tb=short"
    ]))

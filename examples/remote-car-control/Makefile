.PHONY: install test server client demo

install:
	pip install -r requirements.txt

test:
	python -m pytest test_parser.py -v

server:
	python server.py

client:
	python client.py

# Run a non-interactive demo: start server, send a script, then stop
demo:
	@echo "Starting server in background…"
	@python server.py &
	@SERVER_PID=$$!; \
	sleep 1; \
	echo "Sending demo script…"; \
	python demo_run.py; \
	kill $$SERVER_PID 2>/dev/null; echo "Server stopped."

.PHONY: build run clean build-prod ensure-image

# Docker image name
IMAGE_NAME = altverse-nextjs

# Directory to mount for node_modules caching
NODE_MODULES_CACHE = ${HOME}/.docker-node-modules-cache/$(IMAGE_NAME)

# Helper target to ensure image exists
ensure-image:
	@if [ -z "$$(docker images -q $(IMAGE_NAME))" ]; then \
		echo "Docker image not found. Building..."; \
		make build; \
	fi

build:
	docker build -t $(IMAGE_NAME) ./site

# Updated run target to depend on ensure-image
run: ensure-image
	# Create cache directory if it doesn't exist
	mkdir -p $(NODE_MODULES_CACHE)
	
	# Run container with mounted volumes for source code and node_modules cache
	docker run -it --rm \
		-v $(PWD)/site:/app \
		-v $(NODE_MODULES_CACHE):/app/node_modules \
		-v /app/node_modules/.cache \
		-p 3000:3000 \
		$(IMAGE_NAME) \
		sh -c "npm install && npm run dev"

clean:
	rm -rf $(NODE_MODULES_CACHE)
	docker rmi $(IMAGE_NAME) 2>/dev/null || true

build-prod: ensure-image
	docker run -it --rm \
		-v $(PWD)/site:/app \
		-v $(NODE_MODULES_CACHE):/app/node_modules \
		$(IMAGE_NAME) \
		npm run build
# .gitpod.Dockerfile
FROM gitpod/workspace-full:latest

# Install MongoDB tools
RUN sudo apt-get update \
    && sudo apt-get install -y mongodb-clients

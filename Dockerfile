FROM node:10
COPY . /app
WORKDIR /app
RUN npm install --registry="https://registry.npm.taobao.org"
ENV STATUS deploy
EXPOSE 3001

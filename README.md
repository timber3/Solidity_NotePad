# 주요 인프라 및 버전
![farmyo아키텍처](https://github.com/timber3/Solidity_NotePad/assets/75405129/a249c72f-16fc-4849-bb6b-52b8ed4b61c8)

## 인프라

1. **OS** 
    - Amazon EC2 Unbuntu 20.04 LTS ( 메모리 : 16GB, 디스크 용량 : 320GB )
2. **Storage**
    - Amazon S3 ( Freetier )
3. **Ethereum**
    - Sepolia Testnet
4. **Container**
    - Docker 25.0.4

---

## Back-End

1. **WAS**
    - java : jdk-17.0.1
    - frameWork : Spring boot 3.2.3
    - orm : Spring Data JPA 3.2.3
    - auth : Spring Security 3.2.3
    - token : jwt 0.12.3
    - blockChain : web3j 4.9.0
2. **DB**
    - MySQL 8.0.36
    - Redis 7.2.4

---

## Front-End

1. **javascript**
    - node.js alpine-lts
    - react.js 18.2.0
    - react-redux
2. **CSS**
    - DaisyUI 4.7.3
    - TailwindCSS 3.4.1
3. **BlockChain**
    - web3

---

## CI/CD

1. jenkins 2.440.2

---

## 기타

1. **이슈관리**
    - JIRA
2. **형상관리**
    - Git (GitLab)
3. **커뮤니케이션**
    - MatterMost, Notion
4. **디자인**
    - Figma

---

# 연결

## 사용 중인 ec2 포트

1. ssh - `22`
2. nginx `80:80`, `443:443`
3. mysql `3209:3306`
4. WAS `8080:8080`
5. jenkins `9090:8080`
6. redis `6379:6379`

### 포트 열기

```bash
sudo ufw allow <포트번호>
```

### 포트 확인하기

```bash
sudo ufw status
```

### 사용하는 포트 전부 열어준 후 방화벽 활성화 하기

```bash
sudo ufw enable
```

## SSL 발급

### SSL 인증서 발급하기

```bash
sudo apt-get install letsencrypt
sudo letsencrypt certonly --standalone -d <도메인>
```

명령 수행 후 나오는 아래와 같은 내용을

다른곳에 `ctrl + c` + `ctrl + v` 해두기 (nginx 설정시 인증서의 경로가 필요함)

```
IMPORTANT NOTES:

- Congratulations! Your certificate and chain have been saved at:
/etc/letsencrypt/live/j10d209.p.ssafy.io/fullchain.pem
Your key file has been saved at:
/etc/letsencrypt/live/j10d209.p.ssafy.io/privkey.pem
Your cert will expire on 2024-06-09. To obtain a new or tweaked
version of this certificate in the future, simply run certbot
again. To non-interactively renew *all* of your certificates, run
"certbot renew"
- If you like Certbot, please consider supporting our work by:
    
    Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
    Donating to EFF:                    https://eff.org/donate-le
```

## Docker

### repository 업데이트

```bash
sudo apt update
sudo apt upgrade

sudo apt-get update
```

### 필요한 패키지 설치

```bash
sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common
```

### Docker 공식 GPG키 추가

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

### Docker 공식 apt 저장소 추가

```bash
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
```

### Docker 설치

```java
sudo apt-get update
sudo apt install Docker
```

### Docker 설치 확인

```bash
sudo systemctl status docker
```

Active 에 ‘active(running)’ 확인

## MySQL

### MySQL Docker 이미지 다운로드

```bash
docker pull mysql
```

### MySQL docker-compose.db.yml 생성

```bash
vim docker-compose.db.yml
```

### docker-compose.db.yml 작성

environment 속성으로 사용할 스키마, root 계정의 비밀번호를 설정해준다.

그 후 command 를 통해 컨테이너 빌드 시 초기에 설정이 필요한 옵션들을 넣어준다.

```yaml
# mysql
version: "3.1"
services:
  database:
    container_name: mysql-db
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: farmyo
      MYSQL_ROOT_HOST: '%'
      MYSQL_ROOT_PASSWORD: happyfarmfarm^^
      TZ: 'Asia/Seoul'
    ports:
      - "3209:3306"
    volumes:
      - /home/ubuntu/mysql/conf.d:/etc/mysql/conf.d
    command:
      - "mysqld"
      - "--character-set-server=utf8mb4"
      - "--collation-server=utf8mb4_unicode_ci"
      - "--max_connections=500"
```

### 도커 빌드 하기

```bash
docker compose -f docker-compose.db.yml up -d --build
```

### MySQL 컨테이너 확인하기

```bash
docker ps -a
```

MySQL 컨테이너’mysql-db’이 올바른 포트로 연결 되었고 Status가 Up인지 확인

## Redis

### Redis Docker 이미지 다운로드

```bash
docker pull redis
```

### Redis docker-compose.redis.yml 생성

```bash
vim docker-compose.redis.yml
```

### docker-compose.redis.yml 작성

redis 접근시 필요한 비밀번호를 지정해준다.

```bash
version: "3.1"
services:
  redis:
    container_name: redis
    image: redis:latest
    restart: unless-stopped
    hostname: redis
    command: >
      --requirepass farmyo
    ports:
      - "6379:6379"
    labels:
      - "name=redis"
      - "mode=standalone"
```

### 도커 빌드 하기

```bash
docker compose -f docker-compose.redis.yml up -d --build
```

### Redis 컨테이너 확인하기

```bash
docker ps -a
```

redis 컨테이너’redis’가 올바른 포트로 연결 되었고 Status가 Up인지 확인

## Nginx

### Front - Dockerfile 작성

```bash
FROM node:lts-alpine as build-stage
WORKDIR /homepage
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage ./homepage/build /usr/share/nginx/html/
CMD ["nginx", "-g", "daemon off;"]
```

node는 lts-alpine 버전을 사용하고 node-modules를 설치한 후 빌드를 해줍니다.

도커 파일을 /frontend/farmyo 내부에 넣어서 해당 디렉토리에서 빌드할 수 있게 합니다.

### Back - Dockerfile 작성

```bash
FROM openjdk:17-jdk-alpine

WORKDIR /app

ARG JAR_FILE=build/libs/farmyo-0.0.1-SNAPSHOT.jar

COPY ${JAR_FILE} test.jar

ENTRYPOINT ["java", "-jar","test.jar","--encryptor.key=${JASYPT_KEY}"]
```

java는 jdk-17-alpine을 사용하여 jar를 빌드하고 실행해줍니다.

JASYPT로 암호화하고 있기 때문에 환경변수 옵션으로 JASYPT_KEY 값을 줍니다.

위 도커 파일 또한 /backend/farmyo 내부에 넣어서 빌드할 수 있게 해줍니다.

### Front + Back 통합 빌드용 docker-compose.yml 작성

```bash
version: '3.8'                      
services:                           
  farmyo-frontend:                         
    container_name: farmyo-frontend      
    build:                          
      context: ./frontend/farmyo          
      dockerfile: Dockerfile        
    ports:                          
      - "80:80"                     
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt
      - /var/lib/letsencrypt:/var/lib/letsencrypt
      - /home/ubuntu/conf:/etc/nginx/conf.d
    networks:
      - farmyo_network

  farmyo-backend:
    container_name: farmyo-backend
    build:
      context: ./backend/farmyo
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:                    
      JASYPT_KEY: abc
    networks:
      - farmyo_network

networks:
  farmyo_network:
    driver: bridge
```

## Jenkins

### Docker Jenkins 이미지 다운로드

```bash
docker pull jenkins/jenkins:jdk17
```

### Jenkins docker-compose.jenkins.yml 작성

```bash
version: "3.1"
services:
  jenkins:
    image: jenkins/jenkins:jdk17
    restart: unless-stopped
    user: root
    ports:
      - 9090:8080
    volumes:
      - /home/ubuntu/jenkins:/var/jenkins_home
      - /home/ubuntu/.ssh:/root/.ssh
      - /var/run/docker.sock:/var/run/docker.sock
```

### Jenkins 컨테이너 빌드

```bash
docker compose -f docker-compose.jenkins.yml up -d --build
```

### Jenkins 컨테이너로 접속

```bash
docker exec -it jenkins bash
```

### Jenkins 컨테이너 내부 도커 환경 구성

```bash
apt-get update && \
apt-get -y install apt-transport-https \
     ca-certificates \
     curl \
     gnupg2 \
     software-properties-common && \
curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg > /tmp/dkey; apt-key add /tmp/dkey && \
add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") \
   $(lsb_release -cs) \
   stable" && \
apt-get update && \
apt-get -y install docker-ce
```

### 접근 권한 설정

```bash
groupadd -f docker

usermod -aG docker jenkins

chown root:docker /var/run/docker.sock
```

# 빌드 및 배포

## Jenkins

### GitLab

GitLab에 코드를 Push해서 web-hook을 날렸을 때

jenkins가 감지하면 빌드할 수 있도록 환경 설정 필요

### MatterMost

jenkins 빌드 후 배포 완료 되면

MatterMost에 연결된 채널에 배포 알림을 발송하도록 설정 가능

### jenkins pipe-line 작성

```bash
pipeline {
    agent any
    
    stages {
        stage('Clone') {
            steps{
                git branch: 'develop', credentialsId: 'timber3', url: 'https://lab.ssafy.com/s10-blockchain-contract-sub2/S10P22D209.git'           
                sh "sed -i 's/abc/farmyo/g' docker-compose.yml"
                sh "cat docker-compose.yml"
            }
            
        }
        stage('Build'){
            steps{
                dir('backend/farmyo') {
                    sh "chmod +x gradlew"
                    sh "./gradlew clean build"
                }
            }
            
        }
        stage('Deploy') {
            steps{
                // 이전에 실행된 컨테이너를 중지하고 삭제합니다.
                sh "docker stop farmyo-backend || true"
                sh "docker rm farmyo-backend || true"
            
                sh "docker stop farmyo-frontend || true"
                sh "docker rm farmyo-frontend || true"
            
                // 이전에 빌드된 이미지를 삭제합니다.
                sh "docker rmi farmyo_pipeline-farmyo-frontend || true"
                sh "docker rmi farmyo_pipeline-farmyo-backend || true"
                
                sh "docker ps -a || true"
                sh "docker images || true"
                
                sh "docker compose build --no-cache"
                sh "docker compose up -d"
            }
        }
    }
    post {
        success {
        	script {
                def Author_ID = sh(script: "git show -s --pretty=%an", returnStdout: true).trim()
                def Author_Name = sh(script: "git show -s --pretty=%ae", returnStdout: true).trim()
                mattermostSend (color: 'good', 
                message: "빌드 성공 ^_^ v : ${env.JOB_NAME} #${env.BUILD_NUMBER} by ${Author_ID}(${Author_Name})\n(<${env.BUILD_URL}|Details>)", 
                endpoint: 'https://meeting.ssafy.com/hooks/k9wdp45idjypiq41yicy1t7spw', 
                channel: 'd209-cicd'
                )
            }
        }
        failure {
        	script {
                def Author_ID = sh(script: "git show -s --pretty=%an", returnStdout: true).trim()
                def Author_Name = sh(script: "git show -s --pretty=%ae", returnStdout: true).trim()
                mattermostSend (color: 'danger', 
                message: "빌드 실패 ㅜ_ㅜ : ${env.JOB_NAME} #${env.BUILD_NUMBER} by ${Author_ID}(${Author_Name})\n(<${env.BUILD_URL}|Details>)", 
                endpoint: 'https://meeting.ssafy.com/hooks/k9wdp45idjypiq41yicy1t7spw', 
                channel: 'd209-cicd'
                )
            }
        }
    }
}
```

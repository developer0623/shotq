Build the docker image:

```bash
docker build -t shootq-static .
```

Change current directory to the dir with Application/ and run the build:

```bash
docker run -v $(pwd):/mnt shootq-static:latest /root/build.sh
```
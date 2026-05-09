FROM alpine:latest

RUN apk add --no-cache \
    git \
    gcc \
    musl-dev \
    make \
    iptables \
    ipset \
    iproute2 \
    netfilter-queue-dev \
    libnetfilter_queue-dev \
    libnfnetlink-dev \
    libpcap-dev \
    linux-headers

WORKDIR /opt

# Клонируем zapret
RUN git clone --depth 1 https://github.com/bol-van/zapret.git

WORKDIR /opt/zapret

# Компилируем
RUN make -j$(nproc)

COPY config/ /opt/zapret/config/
COPY scripts/start.sh /start.sh
RUN chmod +x /start.sh

ENTRYPOINT ["/start.sh"]
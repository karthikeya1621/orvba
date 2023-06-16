export function withDate(data: any, keys: string[]) {
    if(keys && data) {
        keys.forEach(key => {
            if(data[key] && data[key]['seconds'] && data[key]['nanoseconds']) {
                data[key] = new Date(data[key].seconds * 1000 + data[key].nanoseconds/1000000);
            }
        })
    }
    return data;
}

export function randomOtp() {
    return Math.floor(1000 + Math.random() * 9000);
}

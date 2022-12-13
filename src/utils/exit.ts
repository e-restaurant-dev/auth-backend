export const exit = () => {
    process.kill(process.pid, 'SIGTERM')
}

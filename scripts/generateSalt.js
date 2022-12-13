const randomBytes = Array.from({ length: 16 }, () => (
    Math.floor(Math.random() * 256).toString(16)
))

process.stdout.write(
    randomBytes.join(','),
)

module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/v1/word',
        destination: 'http://localhost:8010/api/v1/word', // Matched parameters can be used in the destination
      },
    ]
  },
  reactStrictMode: true
}
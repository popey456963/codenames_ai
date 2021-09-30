// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const spawn = require("child_process").spawn;

export default (req, res) => {
  res.status(200).json({ name: 'John Doe' })
}

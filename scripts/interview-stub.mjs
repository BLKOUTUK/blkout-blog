// Local stand-in for ivor-core's /api/guest-interview, for rendering public/interview/index.html. No model, nothing saved.
import http from 'node:http'
const Q = ['Tell us about Portaul in a sentence or two, and about yourself.', 'What made you build it? Was there a particular moment?', 'Black gay, bi and trans men have every reason to be careful about who holds their health information. What would you say to someone who is wary?', 'For many of us, testing still carries shame or fear. How does Portaul try to change that?', 'What does “looking after each other” mean to you, when it comes to sexual health?', 'Joseph Beam Day is about Black queer men looking out for themselves and each other. Where does Portaul fit in that?', 'What comes next for Portaul in 2027?', 'If every man reading this did one thing this winter, what would you want it to be?']
const state = { transcript: [], bio: '', status: 'open' }
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Headers', 'content-type'); res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS')
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end() }
  const send = (c, o) => { res.writeHead(c, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)) }
  if (!req.url.startsWith('/api/guest-interview/') || req.url.includes('BADBAD')) return send(404, { error: 'not found' })
  let raw = ''; req.on('data', (c) => { raw += c }); req.on('end', () => {
    const b = raw ? JSON.parse(raw) : {}
    if (req.method === 'GET') return send(200, { title: 'BLKOUT Voices interview: Portaul', guestName: 'Doyin', questions: Q, ...state,
      intro: ['Eight questions, one at a time. Answer as many as you like, in your own words: between 400 and 800 words in total is plenty.', 'After some answers Ivor, our interviewer, may ask one short follow-up. He never puts words in your mouth, and you can skip anything.', 'Your answers save as you go, so you can stop and come back to this link. Nothing is published until we have sent you the edited text.'] })
    if (req.url.endsWith('/follow-up')) return send(200, { followUp: b.questionIndex === 1 ? 'You said there has to be “a kinder way to tell someone”. In practice, what happens when a man uses Portaul to tell a partner about an exposure?' : null })
    if (req.url.endsWith('/submit')) { Object.assign(state, { transcript: b.transcript, bio: b.bio, status: 'submitted' }); return send(200, { status: 'SUBMITTED' }) }
    Object.assign(state, { transcript: b.transcript, bio: b.bio || '' }); return send(200, { status: 'SAVED' })
  })
}).listen(8790)

import Cors from 'cors'

const whitelist = ['localhost:3000' ];

const corsOptions = {
  origin: (origin: any, callback: (err: Error | null, origin?: any | undefined) => any) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

export const cors = Cors({
  methods: ['POST', 'GET', 'HEAD', 'OPTIONS'],
  ...corsOptions,
});
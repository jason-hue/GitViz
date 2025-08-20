import passport from 'passport'
import { Strategy as GitHubStrategy } from 'passport-github2'
import { User } from '../models'

export const setupPassport = () => {
  // GitHub OAuth策略
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'dummy-client-id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy-client-secret',
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:8000/api/auth/github/callback'
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // 查找或创建用户
      let user = await User.findOne({
        where: { githubId: profile.id }
      })

      if (!user) {
        user = await User.create({
          username: profile.username,
          email: profile.emails?.[0]?.value || '',
          avatar: profile.photos?.[0]?.value,
          githubId: profile.id,
          githubAccessToken: accessToken
        })
      } else {
        // 更新用户信息
        await user.update({
          avatar: profile.photos?.[0]?.value,
          githubAccessToken: accessToken
        })
      }

      return done(null, user)
    } catch (error) {
      return done(error, null)
    }
  }))

  // 序列化用户
  passport.serializeUser((user: any, done) => {
    done(null, user.id)
  })

  // 反序列化用户
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await User.findByPk(id)
      done(null, user)
    } catch (error) {
      done(error, null)
    }
  })
}
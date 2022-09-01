import fs from 'fs'
import path from 'path'
import { Multipart } from '@fastify/multipart'
import {
  API_ORIGIN,
  API_USER_ID,
  API_USER_PASS,
  API_UPLOAD_DIR,
  API_BASE_PATH
} from './envValues'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const iconsDir = API_UPLOAD_DIR && path.resolve(API_UPLOAD_DIR, 'icons')

// const createIconURL = (dir: string, name: string) =>
// `${API_ORIGIN}/${dir}icons/${name}`
const createIconURL = (name: string) =>
  `${API_ORIGIN}${API_BASE_PATH}/icons/${name}`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getUserIconName = (_id: string) => {
  return `user-icon`
}
// export const getUserInfo = (id: string) => {
//   const iconName = getUserIconName(id)
//   return {
//     name: 'sample user',
//     icon:
//       iconsDir && fs.existsSync(path.resolve(iconsDir, iconName))
//         ? createIconURL('upload/', iconName)
//         : createIconURL('static/', `dummy.svg`)
//   }
// }

export const validateUser = async (id: string, pass: string) => {
  const _user = await prisma.user.findUnique({ where: { id } })
  return await bcrypt.compare(pass, _user?.pass || '')
  // return id === API_USER_ID && pass === API_USER_PASS
}

export const getUserInfoById = async (id: string) => {
  const _user = await prisma.user.findUnique({ where: { id } })
  if (_user) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pass, ..._userInfo } = _user
    return _userInfo
  }
}
// ({ id, ...getUserInfo(id) })

export const changeIcon = async (id: string, iconFile: Multipart) => {
  // const iconName = getUserIconName(id)
  const iconName = `${Date.now()}${path.extname(iconFile.filename)}`
  await fs.promises.writeFile(
    path.resolve(iconsDir, iconName),
    await iconFile.toBuffer()
  )
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pass, ..._userInfo } = await prisma.user.update({
    where: { id },
    data: { icon: createIconURL(iconName) }
  })
  return _userInfo

  // if (!iconsDir) {
  //   throw new Error('API_UPLOAD_DIR is not configured.')
  // }

  // await fs.promises.mkdir(iconsDir, { recursive: true })

  // await fs.promises.writeFile(
  //   path.resolve(iconsDir, iconName),
  //   await iconFile.toBuffer()
  // )

  // return {
  //   id,
  //   ...getUserInfo(id)
  // }
}

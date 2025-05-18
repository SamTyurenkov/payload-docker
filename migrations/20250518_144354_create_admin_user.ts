import {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-mongodb'

export async function up({ payload, req, session }: MigrateUpArgs): Promise<void> {
  await payload.delete({
    collection: 'users',
    depth: 0,
    where: {
      email: {
        equals: 'demo-author@example.com',
      },
    },
  })

  await payload.create({
    collection: 'users',
    data: {
      name: 'Demo Admin',
      email: 'demo-author@example.com',
      password: 'password',
    },
  })
}

export async function down({ payload, req, session }: MigrateDownArgs): Promise<void> {
  await payload.delete({
    collection: 'users',
    depth: 0,
    where: {
      email: {
        equals: 'demo-author@example.com',
      },
    },
  })
}

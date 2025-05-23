import {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-mongodb'
import type { Project, User } from '@/payload-types';

export async function up({ payload, req, session }: MigrateUpArgs): Promise<void> {
  // Migration code
  const userDocs = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: 'demo-author@example.com',
      },
    },
  })

  // Parse the User object from the paginated response
  const demoAdmin = userDocs.docs[0]; // Extract the first matching user
  if (!demoAdmin) {
    throw new Error('No demo admin user found. Please create the user before running this migration.');
  }

  // Seed projects into the 'projects' collection
  console.log('Seeding projects...');
  const projects: Omit<Project, "updatedAt" | "createdAt" | "id" | "sizes">[] = [
    {
      title: 'Project 1',
      _status: 'published',
      status: 'completed',
      deadline: '2023-12-31T23:59:59.000Z', // ISO 8601 datetime format
      authors: [demoAdmin.id],
      assigned: [demoAdmin.id],
      budget: 5000,
    },
    {
      title: 'Project 2',
      _status: 'published',
      status: 'in-progress',
      deadline: '2025-08-15T23:59:59.000Z',
      authors: [demoAdmin.id],
      assigned: [demoAdmin.id],
      budget: 7500,
    },
    {
      title: 'Project 3',
      _status: 'published',
      status: 'planned',
      deadline: '2026-11-01T23:59:59.000Z',
      authors: [demoAdmin.id],
      assigned: [demoAdmin.id],
      budget: 10000,
    },
  ];

  for (const project of projects) {
    await payload.create({
      collection: 'projects',
      depth: 0,
      context: {
        disableRevalidate: true,
      },
      data: project,
    });
  }

  console.log('Projects seeded successfully.');
}

export async function down({ payload, req, session }: MigrateDownArgs): Promise<void> {
  // Remove all seeded projects from the 'projects' collection
  console.log('Removing seeded projects...');
  const projects = await payload.find({
    collection: 'projects',
    where: {
      or: [
        {
          title: {
            like: 'Project 1',
          },
        },
        {
          title: {
            like: 'Project 2',
          },
        },
        {
          title: {
            like: 'Project 3',
          },
        },
      ]
    }
  });

  for (const project of projects.docs) {
    await payload.delete({
      collection: 'projects',
      id: project.id,
    });
  }
  console.log('Seeded projects removed successfully.');
}

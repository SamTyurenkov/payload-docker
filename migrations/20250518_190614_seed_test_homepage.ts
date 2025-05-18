import {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-mongodb'
import type { Page, User, Media } from '@/payload-types';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function up({ payload, req, session }: MigrateUpArgs): Promise<void> {
  // Find our demo user
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


  // Path to the local media file
  const filePath = path.resolve(__dirname, './media/pages/home/image-hero1.webp');
  // Read the file into a buffer
  const fileBuffer = fs.readFileSync(filePath);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  // Upload the media file
  const imageHero: Omit<Media, 'createdAt' | 'id' | 'updatedAt'> = {
    alt: 'Straight metallic shapes with a blue gradient',
  }
  type File = {
    data: Buffer;
    mimetype: string;
    name: string;
    size: number;
  };

  // Construct the File object
  const file: File = {
    data: fileBuffer, // Binary data of the file
    mimetype: 'image/webp', // MIME type of the file
    name: 'image-hero1.webp', // Name of the file
    size: fileBuffer.length, // Size of the file in bytes
  };

  const mediaDoc = await payload.create({
    collection: 'media', // Replace with your media collection name
    data: imageHero, // Metadata for the file (if any)
    file, // Pass the file buffer here
    overwriteExistingFiles: true, // Overwrite if the file already exists
  });

  const page: Omit<Page, 'id' | 'updatedAt' | 'createdAt' | 'sizes'> = {
    title: 'Test Homepage',
    authors: [demoAdmin],
    slug: 'home',
    hero: {
      type: 'highImpact',
      links: [
      ],
      media: mediaDoc,
      richText: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Dimovtax Test Task',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              tag: 'h1',
              version: 1,
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: "This page displays a layout with projects, visit ",
                  version: 1,
                },
                {
                  type: 'link',
                  children: [
                    {
                      type: 'text',
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: 'admin dashboard',
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  fields: {
                    linkType: 'custom',
                    newTab: false,
                    url: '/admin',
                  },
                  format: '',
                  indent: 0,
                  version: 3,
                },
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: "  to add or edit them.",
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
    },
    layout: [
      {
        blockName: 'Archive Block',
        blockType: 'archive',
        categories: [],
        introContent: {
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Recent posts',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                tag: 'h3',
                version: 1,
              },
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'The posts below are displayed in an "Archive" layout building block which is an extremely powerful way to display documents on a page. It can be auto-populated by collection or by category, or posts can be individually selected. Pagination controls will automatically appear if the number of results exceeds the number of items per page.',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        populateBy: 'collection',
        relationTo: 'projects',
      },
    ]
  }

  await payload.create({
    collection: 'pages',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: page,
  });
}

export async function down({ payload, req, session }: MigrateDownArgs): Promise<void> {
  //TODO: payload doesnt respect migrations order, so we need that user again
  try {
    await payload.create({
      collection: 'users',
      data: {
        name: 'Demo Admin',
        email: 'demo-author@example.com',
        password: 'password',
      },
    })
  } catch {

  }

  // Migration code
  await payload.delete({
    collection: 'pages',
    where: {
      slug: {
        equals: 'home'
      }
    }
  });

  await payload.delete({
    collection: 'media',
    where: {
      filename: {
        equals: 'image-hero1.webp',
      },
    },
  });

  await payload.delete({
    collection: 'users',
    depth: 0,
    where: {
      email: {
        equals: 'demo-author@example.com',
      },
    },
  })
  console.log('Seeded test homepage deleted.');
}

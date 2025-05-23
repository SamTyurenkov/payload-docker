import type { Block } from 'payload'

import {
    FixedToolbarFeature,
    HeadingFeature,
    InlineToolbarFeature,
    lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const ProjectsTable: Block = {
    slug: 'projectsTable',
    interfaceName: 'ProjectsTableBlock',
    fields: [
        {
            name: 'introContent',
            type: 'richText',
            editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                    return [
                        ...rootFeatures,
                        HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                        FixedToolbarFeature(),
                        InlineToolbarFeature(),
                    ]
                },
            }),
            label: 'Intro Content',
        },
        {
            name: 'relationTo',
            type: 'select',
            defaultValue: 'projects',
            label: 'Collections To Show',
            options: [
                {
                    label: 'Projects',
                    value: 'projects',
                },
            ],
        },
        {
            name: 'limit',
            type: 'number',
            defaultValue: 10,
            label: 'Limit',
        }
    ],
    labels: {
        plural: 'ProjectsTables',
        singular: 'ProjectTable',
    },
}

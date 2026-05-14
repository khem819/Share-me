import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import { schemas } from './schemas'

export default defineConfig({
  name: 'default',
  title: 'shareme__jsm',

  projectId: 'opva3doj',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemas,
  },
})

import {folderInput} from 'rollup-plugin-folder-input';

export default [
  {
    input: 'src/index.js',
    treeshake: false,
    output: [
      {
        file: 'dist/await-locks.esm.js',
        format: 'es',
      },
      {
        file: 'dist/await-locks.umd.js',
        format: 'umd',
        name: 'AwaitLocks',
      },
    ]
  },
  {
    input: 'src/**/*.js',
    treeshake: false,
    plugins: [
      folderInput(),
    ],
    output: {
      dir: 'lib',
      format: 'cjs',
      exports: 'auto',
      entryFileNames: '[name].cjs'
    }
  }
];

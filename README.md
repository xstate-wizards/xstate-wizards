# 🔮 XState Wizards 🧙🏽‍♂️

Handle incredibly complex questionnaires with ease. A WIP set of libraries that let you easily create state machines and wrapping UI components to drive them. In the future, also a GUI builder for non-coding team members to create and update flows easily.

note: files in packages cannot use console.log. user logger.debug or logger.info instead
must run 'yarn yalcpush' after making any change in a package, to see it in an example
must run 'yarn patch' in the package directory you change for this to update on NPM

#### Local Pkg Dev Commands in Examples

In Root:

- `yarn build`

In Example Dir After Making Changes:

- `npx yalc link <package>`
- `npx yalc update` or `npx yalc update <package>`

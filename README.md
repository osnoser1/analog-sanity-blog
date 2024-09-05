# A statically generated blog example using Analog.js and Sanity

![Screenshot of Sanity Studio using Presentation Tool to do Visual Editing](https://github.com/sanity-io/next.js/assets/81981/59ecd9d6-7a78-41c6-95f7-275f66fe3c9d)

This starter is a statically generated blog that uses Analog.js for the frontend and [Sanity][sanity-homepage] to handle its content. It comes with a native Sanity Studio that offers features like real-time collaboration and visual editing with live updates using [Presentation][presentation].

The Studio connects to Sanity Content Lake, which gives you hosted content APIs with a flexible query language, on-demand image transformations, powerful patching, and more. You can use this starter to kick-start a blog or learn these technologies.

## Features

- A performant, static blog with editable posts, authors, and site settings
- TypeScript setup with [Sanity TypeGen](https://www.sanity.io/docs/sanity-typegen)
- A native and customizable authoring environment, accessible on `yourblog.com/studio`
- Real-time and collaborative content editing with fine-grained revision history
- Side-by-side instant content preview that works across your whole site
- Support for block content and the most advanced custom fields capability in the industry
- Incremental Static Revalidation; no need to wait for a rebuild to publish new content
- Unsplash integration setup for easy media management
- [Sanity AI Assist preconfigured for image alt text generation](https://www.sanity.io/docs/ai-assist?utm_source=github.com&utm_medium=organic_social&utm_campaign=ai-assist&utm_content=)
- Out of the box support for [Vercel Visual Editing](https://www.sanity.io/blog/visual-editing-sanity-vercel?utm_source=github.com&utm_medium=referral&utm_campaign=may-vercel-launch).

## Demo

### [https://analog-blog.sanity.build](https://analog-blog.sanity.build)

## Deploy your own

Use the Deploy Button below, you'll deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=analog-example) as well as connect it to your Sanity dataset using [the Sanity Vercel Integration][integration].

[![Deploy with Vercel](https://vercel.com/button)][vercel-deploy]

## How to use

Execute the following command to create a new Nx workspace with this example:

```bash
npx create-nx-workspace@latest analog-sanity-blog --preset=analog
```

Navigate to the newly created project:

```bash
cd analog-sanity-blog
```

Install the dependencies:

```bash
npm install
```

Whenever you edit a GROQ query you update the TypeScript types by running:

```bash
npm run typegen
```

# Configuration

- [Step 1. Set up the environment](#step-1-set-up-the-environment)
- [Step 2. Run Analog.js locally in development mode](#step-2-run-analogjs-locally-in-development-mode)
- [Step 3. Populate content](#step-3-populate-content)
- [Step 4. Deploy to production](#step-4-deploy-to-production)

## Step 1. Set up the environment

### Reuse remote environment variables

If you started with [deploying your own](#deploy-your-own) then you can run this to reuse the environment variables from the Vercel project and skip to the next step:

```bash
npx vercel link
npx vercel env pull
````
### Using the Sanity CLI

Copy the `.env.local.example` file to `.env.local` to get started:

```bash
cp .env.local.example .env.local
```
Run the setup command to get set up with a Sanity project, dataset, and their relevant environment variables:

```bash
npm run setup
```

You'll be asked multiple questions, here's a sample output of what you can expect:

```bash
Need to install the following packages:
sanity@3.30.1
Ok to proceed? (y) y
You're setting up a new project!
We'll make sure you have an account with Sanity.io.
Press ctrl + C at any time to quit.
Prefer web interfaces to terminals?
You can also set up best practice Sanity projects with
your favorite frontends on https://www.sanity.io/templates
Looks like you already have a Sanity-account. Sweet!
✔ Fetching existing projects
? Select project to use Templates [r0z1eifg]
? Select dataset to use blog-vercel
? Would you like to add configuration files for a Sanity project in this Analog.js folder? No
Detected framework Analog.js, using prefix 'VITE_'
Found existing VITE_SANITY_PROJECT_ID, replacing value.
Found existing VITE_SANITY_DATASET, replacing value.
```

It's important that when you're asked "Would you like to add configuration files for a Sanity project in this Analog.js folder?" that you answer "No" as this example is already set up with the required configuration files.

#### Creating a read token

This far your `.env.local` file should have values for `VITE_SANITY_PROJECT_ID` and `VITE_SANITY_DATASET`.
Before you can run the project you need to set up a read token (`SANITY_API_READ_TOKEN`), it's used for authentication when Sanity Studio is live previewing your application.

1. Go to [manage.sanity.io](https://manage.sanity.io/) and select your project.
2. Click on the `🔌 API` tab.
3. Click on `+ Add API token`.
4. Name it "analog blog live preview read token" and set `Permissions` to `Viewer` and hit `Save`.
5. Copy the token and add it to your `.env.local` file.

```bash
SANITY_API_READ_TOKEN="<paste your token here>"
```

Your `.env.local` file should look something like this:

```bash
VITE_SANITY_PROJECT_ID="r0z1eifg"
VITE_SANITY_DATASET="blog-vercel"
SANITY_API_READ_TOKEN="sanity-token-here"
```

> [!CAUTION]  
> Make sure to add `.env.local` to your `.gitignore` file so you don't accidentally commit it to your repository.

## Step 2. Run Analog.js locally in development mode

```bash
npm run dev
```


Your blog should be up and running on [http://localhost:4200](http://localhost:4200)! If it doesn't work, post on [GitHub discussions](https://github.com/analogjs/analog/discussions).

## Step 3. Populate content

(Content remains the same as in the previous version)

## Step 4. Deploy to production

(Content remains the same as in the previous version)

## Next steps

- [Join the Sanity community](https://slack.sanity.io/)

## Related examples

(The list of related examples remains the same as in the original README)

[vercel-deploy]: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fanalogjs%2Fanalog%2Ftree%2Fmain%2Fexamples%2Fcms-sanity&repository-name=cms-sanity&project-name=cms-sanity&demo-title=Blog%20using%20Analog.js%20%26%20Sanity&demo-description=Real-time%20updates%2C%20seamless%20editing%2C%20no%20rebuild%20delays.&demo-url=https%3A%2F%2Fanalog-blog.sanity.build%2F&demo-image=https%3A%2F%2Fgithub.com%2Fsanity-io%2Fnext-sanity%2Fassets%2F81981%2Fb81296a9-1f53-4eec-8948-3cb51aca1259&integration-ids=oac_hb2LITYajhRQ0i4QznmKH7gx
[integration]: https://www.sanity.io/docs/vercel-integration
[sanity-homepage]: https://www.sanity.io?utm_source=github.com&utm_medium=referral&utm_campaign=analogjs-v1vercelstarter
[presentation]: https://www.sanity.io/docs/presentation
[enable-ai-assist]: https://www.sanity.io/plugins/ai-assist#enabling-the-ai-assist-api
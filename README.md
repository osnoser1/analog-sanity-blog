# Analog Sanity Blog

![Screenshot of Sanity Studio using Presentation Tool to do Visual Editing](https://cdn.sanity.io/images/h0s9bb5k/production/6d21d90950b4368d781ad4a42cebc65fef5569f4-3312x1744.png)

This starter is a statically generated blog example using [Analog][analog] and [Sanity][sanity-homepage], to handle its content. It comes with a native Sanity Studio that offers features like real-time collaboration and visual editing with live updates using [Presentation][presentation] and [Limitless Angular][limitless-angular].

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
- Visual editing feature powered by Analog and Limitless Angular

## Unique Features

- Zone-free blog (not using zone.js)
- Utilizes the latest Angular features, including signals and built-in control flow
- Integration with [Limitless Angular][limitless-angular] for enhanced Sanity.io integration

## Demo

### [https://analog-sanity-blog.vercel.app](https://analog-sanity-blog.vercel.app)

## Deploy your own

Before deploying, follow these steps:

1. Create a `BYPASS_TOKEN` Environment Variable to store a revalidation secret:
   - Use the command `openssl rand -base64 32` or [Generate a Secret](https://generate-secret.vercel.app/32) to generate a random value.

2. Click the deploy button below:

[![Deploy with Vercel](https://vercel.com/button)](vercel-deploy)

3. In the Vercel UI, add the `BYPASS_TOKEN` secret you generated earlier.

## How to use

Execute [`create-nx-workspace`](https://nx.dev/getting-started/intro) with [npm](https://docs.npmjs.com/cli/init), [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/), or [pnpm](https://pnpm.io) to bootstrap the example:

```bash
npx create-nx-workspace@latest analog-sanity-blog --preset=analog
```

```bash
yarn create nx-workspace analog-sanity-blog --preset=analog
```

```bash
pnpm create nx-workspace analog-sanity-blog --preset=analog
```

Whenever you edit a GROQ query you update the TypeScript types by running:

```bash
npm run typegen
```

# Configuration

- [Step 1. Set up the environment](#step-1-set-up-the-environment)
  - [Reuse remote envionment variables](#reuse-remote-envionment-variables)
  - [Using the Sanity CLI](#using-the-sanity-cli)
    - [Creating a read token](#creating-a-read-token)
- [Step 2. Run Analog locally in development mode](#step-2-run-analog-locally-in-development-mode)
- [Step 3. Populate content](#step-3-populate-content)
- [Step 4. Deploy to production](#step-4-deploy-to-production)
- [Next steps](#next-steps)

## Step 1. Set up the environment

### Reuse remote envionment variables

If you started with [deploying your own](#deploy-your-own) then you can run this to reuse the environment variables from the Vercel project and skip to the next step:

```bash
npx vercel link
npx vercel env pull
```

### Using the Sanity CLI

Copy the `.env.local.example` file to `.env.local` to get started:

```bash
cp .env.local.example .env.local
```

Run the setup command to get setup with a Sanity project, dataset and their relevant environment variables:

```bash
npm run setup
```

```bash
yarn setup
```

```bash
pnpm run setup
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
? Select dataset to use production

Detected framework Vite, using prefix 'VITE_'
Found existing VITE_SANITY_PROJECT_ID, replacing value.
Found existing VITE_SANITY_DATASET, replacing value.
```

#### Creating a read token

This far your `.env.local` file should have values for `VITE_SANITY_PROJECT_ID` and `VITE_SANITY_DATASET`.
Before you can run the project you need to setup a read token (`SANITY_API_READ_TOKEN`), it's used for authentication when Sanity Studio is live previewing your application.

1. Go to [manage.sanity.io](https://manage.sanity.io/) and select your project.
2. Click on the `🔌 API` tab.
3. Click on `+ Add API token`.
4. Name it "next blog live preview read token" and set `Permissions` to `Viewer` and hit `Save`.
5. Copy the token and add it to your `.env.local` file.

```bash
SANITY_API_READ_TOKEN="<paste your token here>"
```

Your `.env.local` file should look something like this:

```bash
VITE_SANITY_PROJECT_ID="r0z1eifg"
VITE_SANITY_DATASET="blog-vercel"
SANITY_API_READ_TOKEN="sk..."
```

> [!CAUTION]  
> Make sure to add `.env.local` to your `.gitignore` file so you don't accidentally commit it to your repository.

## Step 2. Run Analog locally in development mode

```bash
npm install && npm run dev:all
```

```bash
yarn install && yarn dev:all
```

```bash
pnpm -r --link-workspace-packages install && pnpm dev:all
```

Your blog should be up and running on [http://localhost:4200](http://localhost:4200)! If it doesn't work, post on [GitHub discussions](https://github.com/limitless-angular/limitless-angular/discussions).

## Step 3. Populate content

Open your Sanity Studio that should be running on [http://localhost:3333](http://localhost:3333).

By default you're taken to the [Presentation tool][presentation], which has a preview of the blog on the left hand side, and a list of documents on the right hand side.

<details>
<summary>View screenshot ✨</summary>

![screenshot](https://github.com/vercel/next.js/assets/81981/07cbc580-4a03-4837-9aa4-90b632c95630)

</details>

We're all set to do some content creation!

- Click on the **"+ Create"** button top left and select **Post**
- Type some dummy data for the **Title**
- **Generate** a **Slug**
  <details>
  <summary>Now that you have a slug you should see the post show up in the preview on the left hand side ✨</summary>

  ![screenshot](https://github.com/vercel/next.js/assets/81981/05b74848-6ae4-442b-8995-0b7e2180aa74)

  </details>

- Fill in **Content** with some dummy text
  <details>
  <summary>Or generate it with AI Assist ✨</summary>

  If you've enabled [AI Assist][enable-ai-assist] you click on the sparkles ✨ button and generate a draft based on your title and then on **Generate sample content**.

  ![screenshot](https://github.com/vercel/next.js/assets/81981/2276d8ad-5b55-447c-befe-d53249f091e1)

  </details>

- Summarize the **Content** in the **Excerpt** field
  <details>
  <summary>Or have AI Assist summarize it for you ✨</summary>

  If you've enabled [AI Assist][enable-ai-assist] you click on the sparkles ✨ button and then on **Generate sample content**.

  ![screenshot](https://github.com/vercel/next.js/assets/81981/d24b9b37-cd88-4519-8094-f4c956102450)

  </details>

- Select a **Cover Image** from [Unsplash].
  <details>
  <summary>Unsplash is available in the **Select** dropdown ✨</summary>

  ![screenshot](https://github.com/vercel/next.js/assets/81981/204d004d-9396-434e-8795-a8b68a2ed89b)

  </details>
  <details>
  <summary>Click the "Crop image" button to adjust hotspots and cropping ✨</summary>

  ![screenshot](https://github.com/vercel/next.js/assets/81981/e905fc6e-5bab-46a7-baec-7cb08747772c)

  </details>
  <details>
  <summary>You can preview the results live on the left side, and additional formats on the right side ✨</summary>

  ![screenshot](https://github.com/vercel/next.js/assets/81981/6c59eef0-d2d9-4d77-928a-98e99df4b1df)

  </details>

- Customize the blog name, description and more.
  <details>
  <summary>Click "Structure" at the top center, then on "Settings" on the left hand side ✨</summary>

  ![screenshot](https://github.com/vercel/next.js/assets/81981/14f48d83-af81-4589-900e-a7a598cc608a)

  </details>
  <details>
  <summary>Once you have a "Settings" document, you can customize it inside "Presentation" ✨</summary>

  ![screenshot](https://github.com/vercel/next.js/assets/81981/e3473f7b-5e7e-46ab-8d43-cae54a4b929b)

  </details>

> [!IMPORTANT]  
> For each post record, you need to click **Publish** after saving for it to be visible outside Draft Mode. In production new content is using [Route Rules](https://nitro.unjs.io/config#routerules) to set a Time-based Revalidation, which means it may take up to 1 minute before changes show up. Since a stale-while-revalidate pattern is used you may need to refresh a couple of times to see the changes.

## Step 4. Deploy to production

### 4.1 Deploy the Analog Blog

> [!NOTE]  
> If you already [deployed with Vercel earlier](#deploy-your-own) you can skip this step.

To deploy your local project to Vercel, push it to [GitHub](https://docs.github.com/en/get-started/importing-your-projects-to-github/importing-source-code-to-github/adding-locally-hosted-code-to-github)/GitLab/Bitbucket and [import to Vercel](https://vercel.com/new).

> [!IMPORTANT]  
> When you import your project on Vercel, make sure to click on **Environment Variables** and set them to match your `.env.local` file.

After it's deployed link your local code to the Vercel project:

```bash
npx vercel link
```

> [!TIP]
> In production you can exit Draft Mode by clicking on _"Back to published"_ at the top. On [Preview deployments](https://vercel.com/docs/deployments/preview-deployments) you can [toggle Draft Mode in the Vercel Toolbar](https://vercel.com/docs/workflow-collaboration/draft-mode#enabling-draft-mode-in-the-vercel-toolbar).


### 4.2 Deploy the Sanity Studio

Before deploying the Sanity Studio, we need to set up the correct environment variables:

1. Create a `.env.production.local` file in the root of your project if it doesn't exist already.

2. Add the `VITE_SANITY_PREVIEW_URL` variable to this file, pointing to your deployed Analog blog URL:

````bash
VITE_SANITY_PREVIEW_URL=https://your-analog-blog-url.vercel.app
````

> [!NOTE]
> The `VITE_SANITY_PREVIEW_URL` is used by the Sanity Studio to enable real-time preview of your content on your deployed Analog blog.

3. Update your `.env.local` file with the Studio URL as defined in `sanity.cli.ts`:

````bash
VITE_SANITY_STUDIO_URL=https://analog-sanity-blog-your-project-id.sanity.studio
````

Replace `your-project-id` with your actual Sanity project ID.

> [!NOTE]
> The `VITE_SANITY_STUDIO_URL` is used by your Analog blog to know where to find the Sanity Studio, enabling features like "Edit" buttons that link directly to the Studio.

Now, let's proceed with the deployment:

4. Build the Sanity Studio:

```bash
nx build studio
```

5. Deploy the built Studio to Sanity's servers:

````bash
nx deploy studio
````

6. Once deployed, confirm that the Studio URL matches the one you've set in your `.env.local` file.


7. Update your Vercel deployment with the new Studio URL environment variable:

````bash
npx vercel env add VITE_SANITY_STUDIO_URL
````

8. Redeploy your Analog blog to Vercel to use the new environment variable:

````bash
npx vercel --prod
````

Now both your Analog blog and Sanity Studio are deployed and correctly connected in production. The Studio will be able to preview your Analog blog, and your blog will know where to find the Studio.

## Next steps

- [Join the Sanity community](https://slack.sanity.io/)
- [Learn more about Analog](https://analogjs.org/)
- [Explore Limitless Angular][limitless-angular]
- Ask me anything on [X (Twitter)](https://x.com/osnoser1)

## License

This project is licensed under the MIT License. See our [MIT](LICENSE) file for details.

[vercel-deploy]: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fosnoser1%2Fanalog-sanity-blog&env=BYPASS_TOKEN&envDescription=Revalidation%20secret%20to%20trigger%20%22On-Demand%20Incremental%20Static%20Regeneration%20(ISR)%22&envLink=https%3A%2F%2Fgithub.com%2Fosnoser1%2Fanalog-sanity-blog%2F%3Ftab%3Dreadme-ov-file%23deploy-your-own&project-name=analog-sanity-blog&repository-name=analog-sanity-blog&demo-title=Analog%20Sanity%20Blog%20with%20Limitless%20Angular&demo-description=A%20statically%20generated%20blog%20example%20using%20Analog%2C%20Sanity%20and%20Limitless%20Angular&demo-url=https%3A%2F%2Fanalog-sanity-blog.vercel.app&demo-image=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Fh0s9bb5k%2Fproduction%2F6d21d90950b4368d781ad4a42cebc65fef5569f4-3312x1744.png&integration-ids=oac_hb2LITYajhRQ0i4QznmKH7gx
[integration]: https://www.sanity.io/docs/vercel-integration
[`.env.local.example`]: .env.local.example
[unsplash]: https://unsplash.com
[sanity-homepage]: https://www.sanity.io?utm_source=github.com&utm_medium=referral&utm_campaign=analog-vercel-starter
[limitless-angular]: https://github.com/limitless-angular/limitless-angular
[analog]: https://analogjs.org/
[presentation]: https://www.sanity.io/docs/presentation
[enable-ai-assist]: https://www.sanity.io/plugins/ai-assist#enabling-the-ai-assist-api

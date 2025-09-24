import Link from "next/link";
import { getDictionary } from "~/lib/get-dictionary";
import { Button } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";
import type { Locale } from "~/config/i18n-config";

export default async function ImagePromptPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative px-4 py-20 text-center">
        <div className="mx-auto max-w-6xl">
          {/* Navigation */}
          <nav className="mb-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
                <Icons.Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ImagePrompt.org</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#" className="text-purple-600 font-medium border-b-2 border-purple-600 pb-1">
                Home
              </Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900">
                Inspiration
              </Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900">
                Tutorials
              </Link>
              <div className="relative">
                <button className="flex items-center text-gray-600 hover:text-gray-900">
                  Tools
                  <Icons.ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </div>
              <Link href="#" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Login
            </Button>
          </nav>

          {/* Hero Content */}
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-5xl font-bold leading-tight text-gray-900 md:text-6xl">
              Create Better AI Art
              <br />
              with{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Image Prompt
              </span>
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              Inspire ideas. Enhance image prompt. Create masterpieces
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 px-8 py-3">
                Try it now!
              </Button>
              <Button size="lg" variant="outline" className="border-gray-300 px-8 py-3">
                Tutorials
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Image to Prompt */}
            <div className="group rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100">
                <Icons.Image className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Image to Prompt
              </h3>
              <p className="text-gray-600">
                Convert Image to Prompt to generate your own image
              </p>
            </div>

            {/* Magic Enhance */}
            <div className="group rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
                <Icons.Wand2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Magic Enhance
              </h3>
              <p className="text-gray-600">
                Turn any simple text into detailed, descriptive image prompt
              </p>
            </div>

            {/* AI Describe Image */}
            <div className="group rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
                <Icons.Eye className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                AI Describe Image
              </h3>
              <p className="text-gray-600">
                Let AI help you understand and analyze any image in detail
              </p>
            </div>

            {/* AI Image Generator */}
            <div className="group rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100">
                <Icons.Sparkles className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                AI Image Generator
              </h3>
              <p className="text-gray-600">
                Transform your image prompt into stunning visuals with AI-powered generation
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              You may be interested in:{" "}
              <Link href="#" className="text-purple-600 hover:underline">
                What is an Image Prompt?
              </Link>{" "}
              <Link href="#" className="text-purple-600 hover:underline">
                How to Write Effective Image Prompt?
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* AI Tools Section */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            AI Powered Image Prompt Tools
          </h2>
          <p className="mb-12 text-xl text-gray-600">
            A complete suite of AI tools covering every aspect of your image creation journey
          </p>
          
          {/* Tools Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 mx-auto">
                <Icons.Image className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Image to Prompt</h3>
              <p className="text-sm text-gray-600 mb-4">
                Transform your image into detailed image prompt with Image to Prompt, enhancing your creative process and optimizing AI-driven design efficiency.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Generate Prompt
              </Button>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 mx-auto">
                <Icons.Wand2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Image Prompt Generator</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enhance your AI image generation with our Image Prompt Generator. Turn your idea into detailed, AI-optimized prompts, whether you're fluent in English or not.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Generate Prompt
              </Button>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 mx-auto">
                <Icons.Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">AI Image Generator</h3>
              <p className="text-sm text-gray-600 mb-4">
                Use Image Prompt to effortlessly generate stunning images, enhancing creativity and streamlining your design process with AI-powered precision.
              </p>
              <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                Generate Image Now!
              </Button>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 mx-auto">
                <Icons.Eye className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">AI Describe Image</h3>
              <p className="text-sm text-gray-600 mb-4">
                Let AI help you understand any image - get detailed descriptions, recognize objects, or ask your own questions
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Generate Description
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="mb-12 text-lg text-gray-600">
            Find answers to common questions about Image Prompt
          </p>
          
          <div className="space-y-6 text-left">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-2 font-semibold text-gray-900">
                What is an Image Prompt?
              </h3>
              <p className="text-gray-600">
                An Image Prompt is a set of instructions or words given to an AI to create a picture. It tells the AI what kind of image you want, like describing a scene or object. By using Image Prompt, you can help the AI make images that match your ideas or needs.
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-2 font-semibold text-gray-900">
                How do Image Prompts work in AI image generation?
              </h3>
              <p className="text-gray-600">
                Image prompt plays a crucial role in AI image generation by guiding the AI model to create specific images. They serve as instructions that define the content, style, and details of the desired image.
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-2 font-semibold text-gray-900">
                Is Image Prompt free to use?
              </h3>
              <p className="text-gray-600">
                Yes! We offer free access to our core features: All text-to-prompt tools are completely free, and free users get 5 daily uses of our image-to-text tool. Also, free users get 2 complimentary credits for image generation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
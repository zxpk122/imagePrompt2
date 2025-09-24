"use client";

import React, { useState } from "react";
import { Button } from "@saasfly/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@saasfly/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@saasfly/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@saasfly/ui/select";
import { Upload, Image as ImageIcon, Sparkles, Zap, Brain, Palette, Check } from "lucide-react";

export default function ImageToPromptPage() {
  const [selectedModel, setSelectedModel] = useState("general");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!uploadedImage) return;
    
    setIsGenerating(true);
    
    try {
      // 首先上传图片到扣子
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      
      if (!file) {
        throw new Error('No file selected');
      }

      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/coze/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', uploadResult); // 添加调试日志
      
      // 从嵌套的data结构中提取文件ID
      const fileData = uploadResult.data?.data;
      console.log('File data:', fileData);
      
      // 尝试多种可能的文件ID字段名称
      const fileId = fileData?.id || fileData?.file_id || fileData?.fileId;
      
      if (!fileId) {
        console.error('No file ID found in file data:', fileData);
        throw new Error('Failed to get file ID from upload response');
      }
      
      console.log('Extracted file ID:', fileId); // 添加调试日志

      // 调用工作流生成提示词
      const workflowResponse = await fetch('/api/coze/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });

      if (!workflowResponse.ok) {
        const errorData = await workflowResponse.json();
        console.error('Workflow API Error:', errorData);
        throw new Error('Failed to generate prompt');
      }

      const workflowResult = await workflowResponse.json();
      
      // 调试：显示完整的工作流响应
      console.log('Workflow result:', workflowResult);
      
      // 从工作流结果中提取生成的提示词，添加安全检查
      let prompt = 'Generated prompt will appear here';
      
      if (workflowResult && workflowResult.data && workflowResult.data.prompt) {
        // 使用后端已经解析好的prompt字段
        prompt = workflowResult.data.prompt;
      } else if (workflowResult && workflowResult.prompt) {
        // 备用：直接从根级别获取prompt
        prompt = workflowResult.prompt;
      } else if (workflowResult && workflowResult.data) {
        // 如果后端没有解析，尝试手动解析
        try {
          if (typeof workflowResult.data === 'string') {
            const parsedData = JSON.parse(workflowResult.data);
            prompt = parsedData.output1 || parsedData.output || parsedData.result || prompt;
          } else {
            prompt = workflowResult.data.output1 || workflowResult.data.output || workflowResult.data.result || workflowResult.data.content || prompt;
          }
        } catch (e) {
          console.error('Error parsing workflow data:', e);
          prompt = workflowResult.data.toString();
        }
      } else if (workflowResult && workflowResult.output) {
        prompt = workflowResult.output;
      } else if (workflowResult && workflowResult.result) {
        prompt = workflowResult.result;
      }
      
      console.log('Extracted prompt:', prompt);
      setGeneratedPrompt(prompt);
      
    } catch (error) {
      console.error('Error generating prompt:', error);
      setGeneratedPrompt('Error generating prompt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const models = [
    {
      id: "general",
      name: "General Image Prompt",
      description: "Natural language description of the image",
      icon: <Check className="w-5 h-5" />,
      badge: "Recommended"
    },
    {
      id: "flux",
      name: "Flux",
      description: "Optimized for state-of-the-art Flux AI models, concise natural language",
      icon: <Zap className="w-5 h-5" />,
      badge: null
    },
    {
      id: "midjourney",
      name: "Midjourney",
      description: "Tailored for Midjourney generation with Midjourney parameters",
      icon: <Sparkles className="w-5 h-5" />,
      badge: null
    },
    {
      id: "stable-diffusion",
      name: "Stable Diffusion",
      description: "Formatted for Stable Diffusion models",
      icon: <Palette className="w-5 h-5" />,
      badge: null
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Free Image to Prompt Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert Image to Prompt to generate your own image
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="image-to-prompt" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="image-to-prompt" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Image to Prompt
              </TabsTrigger>
              <TabsTrigger value="text-to-prompt" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Text to Prompt
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image-to-prompt" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Upload Area */}
                <div className="space-y-6">
                  {/* Upload Section */}
                  <Card className="border-2 border-dashed border-purple-200 bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-12">
                      <div className="text-center">
                        <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                          <Upload className="w-10 h-10 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          Upload a photo or drag and drop
                        </h3>
                        <p className="text-gray-500 mb-6">
                          PNG, JPG, or WEBP up to 5MB
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors font-medium"
                        >
                          Upload Image
                        </label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* URL Input */}
                  <Card className="bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-8">
                      <label className="block text-lg font-medium text-gray-700 mb-4">
                        Input Image URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Preview */}
                <div>
                  <Card className="bg-white/50 backdrop-blur-sm h-full min-h-[500px]">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl">Image Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="h-[400px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                        {uploadedImage ? (
                          <img
                            src={uploadedImage}
                            alt="Uploaded preview"
                            className="max-w-full max-h-full object-contain rounded-lg"
                          />
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">Your image will show here</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Model Selection */}
              <Card className="bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Select AI Model</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {models.map((model) => (
                      <div
                        key={model.id}
                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedModel === model.id
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 bg-white hover:border-purple-300"
                        }`}
                        onClick={() => setSelectedModel(model.id)}
                      >
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className={`p-3 rounded-full ${
                            selectedModel === model.id ? "bg-purple-100" : "bg-gray-100"
                          }`}>
                            {React.cloneElement(model.icon, {
                              className: `w-6 h-6 ${
                                selectedModel === model.id ? "text-purple-600" : "text-gray-600"
                              }`
                            })}
                          </div>
                          <div>
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900 text-sm">
                                {model.name}
                              </h3>
                              {model.badge && (
                                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                                  {model.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">
                              {model.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Language Selection and Generate Button */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Prompt Language</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select defaultValue="english">
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="chinese">中文</SelectItem>
                        <SelectItem value="spanish">Español</SelectItem>
                        <SelectItem value="french">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <div className="flex items-end">
                  <Button
                    onClick={handleGeneratePrompt}
                    disabled={!uploadedImage || isGenerating}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Generate Prompt
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              {/* Generated Prompt Result */}
              {generatedPrompt && (
                <Card className="bg-white/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Generated Prompt
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <p className="text-gray-800 leading-relaxed">{generatedPrompt}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                        className="flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleGeneratePrompt()}
                        className="flex items-center gap-2"
                        disabled={!uploadedImage || isGenerating}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Regenerate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="text-to-prompt" className="space-y-6">
              <Card className="bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Text to Prompt (Coming Soon)</CardTitle>
                  <CardDescription>
                    Convert your text description into optimized AI prompts
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">This feature is coming soon!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Bottom Info Section */}
        <div className="mt-12 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-4xl mx-auto">
            <p className="text-sm text-yellow-800">
              <strong>Need to analyze specific aspects like art style or describe people in the image?</strong> Try{" "}
              <span className="font-semibold text-yellow-900">AI Describe Image</span> tool for detailed analysis.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Highly Accurate Image to Prompt Generation
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Convert original images to prompts and regenerate with AI for our prompt accuracy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-600">
                Advanced AI models analyze your images with high precision and accuracy
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Get detailed prompts in seconds with our optimized processing pipeline
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multiple Formats</h3>
              <p className="text-gray-600">
                Support for various AI models including Midjourney, DALL-E, and Stable Diffusion
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
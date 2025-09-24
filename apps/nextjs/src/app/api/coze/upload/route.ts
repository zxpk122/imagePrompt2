import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, JPG, PNG, and WEBP are allowed.' },
        { status: 400 }
      );
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // 准备上传到扣子的FormData
    const cozeFormData = new FormData();
    cozeFormData.append('file', file);

    // 调试：检查环境变量
    console.log('COZE_API_TOKEN exists:', !!process.env.COZE_API_TOKEN);
    console.log('COZE_API_TOKEN length:', process.env.COZE_API_TOKEN?.length || 0);

    // 调用扣子文件上传API
    const cozeResponse = await fetch('https://api.coze.cn/v1/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.COZE_API_TOKEN}`,
      },
      body: cozeFormData,
    });

    if (!cozeResponse.ok) {
      const errorData = await cozeResponse.text();
      console.error('Coze upload error:', errorData);
      return NextResponse.json(
        { error: 'Failed to upload file to Coze' },
        { status: 500 }
      );
    }

    const cozeData = await cozeResponse.json();
    
    return NextResponse.json({
      success: true,
      data: cozeData
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fileId } = await request.json();
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // 根据工作流定义修正参数格式
    const requestBody = {
      workflow_id: process.env.COZE_WORKFLOW_ID,
      parameters: {
        userQuery: "生成图片的提示词",
        img: {
          type: "file",
          file_id: fileId
        },
        promptType: "midjourney",
      },
    };

    console.log('Sending workflow request with correct parameter names:', JSON.stringify(requestBody, null, 2));
    console.log('File ID being sent:', fileId);
    console.log('Environment check:', {
      hasWorkflowId: !!process.env.COZE_WORKFLOW_ID,
      workflowId: process.env.COZE_WORKFLOW_ID,
      hasToken: !!process.env.COZE_API_TOKEN,
    });

    // 调用扣子工作流API
    const workflowResponse = await fetch('https://api.coze.cn/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.COZE_API_TOKEN}`,
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!workflowResponse.ok) {
      const errorData = await workflowResponse.text();
      const errorDetails = {
        status: workflowResponse.status,
        statusText: workflowResponse.statusText,
        headers: Object.fromEntries(workflowResponse.headers.entries()),
        errorData: errorData,
        requestBody: {
          workflow_id: process.env.COZE_WORKFLOW_ID,
          parameters: JSON.stringify({
            image_file_id: fileId
          })
        },
        environment: {
          hasToken: !!process.env.COZE_API_TOKEN,
          tokenLength: process.env.COZE_API_TOKEN?.length || 0,
          hasWorkflowId: !!process.env.COZE_WORKFLOW_ID,
          workflowId: process.env.COZE_WORKFLOW_ID
        }
      };
      
      console.error('Coze workflow error details:', JSON.stringify(errorDetails, null, 2));
      
      return NextResponse.json(
        { 
          error: 'Failed to run workflow', 
          details: errorDetails
        },
        { status: 500 } // 改为500以便前端能看到详细信息
      );
    }

    const workflowData = await workflowResponse.json();
    
    // 添加调试日志
    console.log('Coze workflow response:', JSON.stringify(workflowData, null, 2));
    
    // 检查响应格式并解析结果
    if (workflowData.code === 0 && workflowData.data) {
      // 解析返回的数据，可能是JSON字符串
      let resultData;
      try {
        resultData = typeof workflowData.data === 'string' ? JSON.parse(workflowData.data) : workflowData.data;
      } catch (e) {
        // 如果不是JSON，直接使用原始数据
        resultData = workflowData.data;
      }
      
      return NextResponse.json({
        success: true,
        data: {
          prompt: resultData.output1 || resultData,
          usage: workflowData.usage,
          debug_url: workflowData.debug_url
        }
      });
    }
    
    // 如果有错误码，返回错误信息
    if (workflowData.code !== 0) {
      return NextResponse.json(
        { 
          error: workflowData.msg || 'Workflow execution failed',
          code: workflowData.code,
          debug_url: workflowData.debug_url
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Workflow error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
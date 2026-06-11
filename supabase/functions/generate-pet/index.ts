// Supabase Edge Function: 2D 萌宠头像生成（MVP 占位）
// 后续接入 AI 风格化 API，当前使用首图 + 萌宠风格标记

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PET_STYLES = ['cat', 'dog', 'rabbit', 'hamster', 'fox'] as const;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: '未授权' }), { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: '无效 token' }), { status: 401 });
    }

    const { upload_paths, pet_style } = await req.json();
    if (!upload_paths?.length) {
      return new Response(JSON.stringify({ error: '请至少上传一张照片' }), { status: 400 });
    }

    const style = PET_STYLES.includes(pet_style) ? pet_style : PET_STYLES[Math.floor(Math.random() * PET_STYLES.length)];

    // MVP: 将首图复制到 avatars bucket 作为 2D 头像
    const sourcePath = upload_paths[0];
    const avatarPath = `${user.id}/${Date.now()}.jpg`;

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('pet-uploads')
      .download(sourcePath);

    if (downloadError || !fileData) {
      return new Response(JSON.stringify({ error: '读取上传图片失败' }), { status: 500 });
    }

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(avatarPath, fileData, { contentType: 'image/jpeg', upsert: true });

    if (uploadError) {
      return new Response(JSON.stringify({ error: '保存头像失败' }), { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(avatarPath);

    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl, pet_style: style, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    return new Response(
      JSON.stringify({ avatar_url: publicUrl, pet_style: style }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});

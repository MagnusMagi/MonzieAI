/**
 * Add New Prompts to Scenes Table
 * Script to programmatically add 10 new scene prompts with preview images to Supabase
 *
 * Usage: node add_prompts_to_scenes.js
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - Update these with your credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://groguatbjerebweinuef.supabase.co';
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb2d1YXRiamVyZWJ3ZWludWVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTEwMDY2NSwiZXhwIjoyMDgwNjc2NjY1fQ.AzReOmy0sjsagWar6zv1EKRW3Z41E6Gpd_X_uxz8Y6s';

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Scene prompts data
const scenes = [
  {
    name: 'Urban Reflection in Dramatic Light',
    description:
      'Dramatic, ultra-realistic close-up in black and white with high-contrast cinematic lighting',
    category: 'portrait',
    prompt_template:
      "Dramatic, ultra-realistic close-up in black and white with high-contrast cinematic lighting from the side, highlighting the contours of his face and beard, casting deep shadows. He wears round, reflective sunglasses. He gazes confidently upward into a dark void. The sunglasses reflect a city's towering skyline. The atmosphere is mysterious with a minimalist black background. Details in 4K. Keep the subject's exact facial structure, hair texture, the original photo.",
    preview_url:
      'https://cdn.bananaprompts.xyz/18973a18-e495-4d7c-b8aa-a7fc55767459/cb66879a-fcef-4010-ad28-5033521e664b.png?w=3840&q=75',
    is_active: true,
  },
  {
    name: 'Retrato editorial masculino premium',
    description: 'Studio portrait of a confident man in modern fashion editorial style',
    category: 'portrait',
    prompt_template:
      'Studio portrait of a confident man sitting on a modern beige armchair with wooden legs, leaning slightly forward with his hands together. He wears a dark navy blue dress shirt with the top buttons open, light beige slim-fit pants, and black loafers with tan soles. He has short dark brown hair styled with texture, a trimmed full beard, tanned skin, and an intense confident gaze directed at the camera. The background is minimalist light gray with a smooth gradient, evenly lit with soft natural studio lighting. The mood is cinematic and fashion editorial, with high realism and fine details. Shot with a 50mm lens at f/2.8, vertical framing, full-body composition. the subject from the uploaded image, maintaining the exact real face, hairstyle, skin tone, and body identity unchanged.',
    preview_url:
      'https://cdn.bananaprompts.xyz/ae5f8289-1a58-4605-8d97-0ffa38b6a5cf/76bcf139-247c-40a9-adf1-a450be31a762.jpeg?w=3840&q=75',
    is_active: true,
  },
  {
    name: 'Submerged',
    description: 'Hyper-realistic underwater portrait with cinematic lighting',
    category: 'portrait',
    prompt_template:
      'Hyper-realistic, ultra-detailed close-up portrait showing only the left half of my face submerged in water, one eye in sharp focus, positioned on the far left of the frame, light rays creating caustic patterns on the skin, suspended water droplets and bubbles adding depth, cinematic lighting with soft shadows and sharp highlights, photorealistic textures including skin pores, wet lips, eyelashes, and subtle subsurface scattering, surreal and dreamlike atmosphere, shallow depth of field, underwater macro perspective. 3:4 aspect ratio',
    preview_url:
      'https://cdn.bananaprompts.xyz/2513bb4b-b97f-4488-9f3e-7cc8448f1568/c30a900e-8ba4-4a2d-ac99-d18eb216898d.png?w=3840&q=75',
    is_active: true,
  },
  {
    name: 'Gini',
    description: '8K photorealistic portrait with natural lighting and wind-swept hair',
    category: 'portrait',
    prompt_template:
      'Maintain the same face and person (use attached photo for accurate face Hyper-realistic cinematic Create an 8k photorealistic image using the attached photo. A close-up portrait of a woman with long, jet-black, slightly wind-swept hair falling across her face. Her striking, light-colored eyes gaze upwards and to the right, catching a sharp, diagonal beam of natural light that illuminates the high points of her cheekbone, nose, and plump, glossy, mauve-toned lips a slightly light weight silk',
    preview_url:
      'https://cdn.bananaprompts.xyz/95945df9-736c-4faf-8710-acee35cb47c3/db37e078-415c-41e3-be75-08d64fae3a3b.jpeg?w=3840&q=75',
    is_active: true,
  },
  {
    name: 'A cinematic urban portrait',
    description: 'Cinematic urban portrait with monochromatic style and contemplative posture',
    category: 'portrait',
    prompt_template:
      'A cinematic urban portrait of me, keeping my real face unchanged. I am sitting casually on outdoor stone steps in front of a building entrance, leaning slightly forward with a confident and contemplative posture. My left elbow rests on my knee, with my hand raised to my temple in a thoughtful gesture, while my right arm hangs more loosely, with my hand extended downward in a relaxed position. My legs are bent naturally, spreading apart for a grounded and strong presence. My gaze is directed toward the camera, steady and intense, with a calm yet powerful expression. I am wearing a black outfit: a fitted turtleneck sweater layered under a black coat with a wide collar and subtle texture. The coat has a tailored yet modern look, with a slightly matte fabric that absorbs the light, creating depth. My trousers are also black, slim-fitted, completing the clean, monochromatic style. No visible accessories, emphasizing minimalism and sophistication. The background shows part of an urban building with glass doors and warm interior lights softly glowing, adding contrast to the darker tones of my outfit. The lighting is warm and diffused, highlighting my face and upper body while creating soft shadows that add cinematic depth. The camera captures me slightly from below (low angle), emphasizing strength and presence, framed from the knees up. The focal length resembles a portrait lens around 50-85mm, producing natural proportions with a shallow depth of field that keeps me sharp against the softly blurred background. Style: cinematic, moody urban portrait, editorial fashion photography, minimalistic monochrome outfit, professional model vibe.',
    preview_url:
      'https://cdn.bananaprompts.xyz/3af490e3-bf8b-4fc2-a77f-33dfca4e5040/5dbf467c-003a-43d1-b3ec-c0e46b428c4a.jpeg?w=3840&q=75',
    is_active: true,
  },
  {
    name: 'Foto black tie',
    description: 'Realistic black and white portrait in black tie formal attire',
    category: 'portrait',
    prompt_template:
      'Uma foto realista com todos os traços e linhas idênticos ao da foto com um semblante imponente, em preto em branco, no traje de terno preto e gravata slim.',
    preview_url:
      'https://cdn.bananaprompts.xyz/e7cafee4-0124-4156-90e2-faad0e1e8b60/aad96207-11a9-4943-a8a5-6ede4d234f9f.jpeg?w=3840&q=75',
    is_active: true,
  },
  {
    name: 'Propt moto esportiva',
    description: 'Ultra-realistic portrait with sport motorcycle in outdoor setting',
    category: 'portrait',
    prompt_template:
      'Crie uma imagem minha [foto enviada em anexo] um retrato ultra-realista. Eu estou sentado em uma Moto esportiva preta brilhante em uma área ao ar livre contra o fundo de árvores verdes. Eu uso uma camiseta preta solta, jeans escuros soltos com dobras na parte inferior e tênis Nike preto e branco. Os acessórios usados incluem um relógio preto. Minha mão esquerda descansou casualmente em sua coxa, enquanto sua mão direita descansou na moto enquanto segurava um capacete preto brilhante com uma viseira transparente. A moto parece detalhada com um motor grande, quadro forte e detalhes cromados brilhantes, acentuando a impressão moderna e poderosa. O fundo mostra árvores altas com luz natural suave, criando uma mistura equilibrada de sombra e luz. A expressão é calma e confiante, olhando diretamente para a câmera. O estilo geral é cinematográfico e moderno, combinando a sensação de streetwear jovem com a presença de uma motocicleta arrojada. Alta resolução, estilo editorial fotorrealista.',
    preview_url:
      'https://cdn.bananaprompts.xyz/b19b46c2-89c0-499f-bccc-39e2dcb6ee59/e9313887-c3bd-4837-a411-d5cbf1e7d469.jpeg?w=3840&q=75',
    is_active: true,
  },
  {
    name: 'Studio Photography',
    description: 'Studio photography with vibrant orange background and round sunglasses',
    category: 'portrait',
    prompt_template:
      'Studio photography of a me in a black suit, black turtleneck and round sunglasses with translucent yellow lenses. Vibrant orange background. Unique poses from the front.',
    preview_url:
      'https://cdn.bananaprompts.xyz/68155dad-d783-427e-bb9e-b7254480bf27/6080b41d-5c16-40b8-b8f4-baf2d3722a75.jpeg?w=3840&q=75',
    is_active: true,
  },
  {
    name: 'Instinct and Spirit',
    description: 'Realistic emotional scene with man and lion in winter landscape',
    category: 'portrait',
    prompt_template:
      "Create a realistic and emotional scene showing a man (use the provided image for accurate facial features) and a lion face to face in a moment of connection and respect. The man's eyes are closed, with a serene expression, while the lion gently rests its forehead and muzzle against his, conveying trust and a spiritual bond. Both are standing on ground covered in light snow, with snowflakes gently falling. The man wears a dark coat and hair slightly tousled by the wind, and the lion displays a thick, majestic mane. In the background, a cold, misty natural landscape with blurred mountains and gray tones reinforces the calm and powerful atmosphere. The lighting is soft and diffuse, highlighting the textures of the skin, fur, and coat, creating a cinematic and poetic atmosphere. The composition should convey friendship, courage, and harmony between man and nature. Suggested settings: Style: Ultra-realistic, cinematic, 8K Lighting: Soft, diffuse, natural winter light Camera: Medium close-up, focus on expressions Emotion: Connection, respect, tranquility Setting: Falling snow, blurred background with mountains",
    preview_url:
      'https://cdn.bananaprompts.xyz/f4f238cc-bb8e-4716-bfde-51c2718d5984/7761e3e5-32c1-47a7-8dfa-9f650aec6af3.png?w=3840&q=75',
    is_active: true,
  },
  {
    name: 'Untamed Spirit',
    description: 'Cinematic portrait with horse in open field setting',
    category: 'portrait',
    prompt_template:
      "A cinematic, mid-length portrait, capturing a female figure with a strong and elegant presence, standing next to a horse. The subject faces the camera, with a direct and confident gaze. One hand gently holds the horse's halter or head, conveying a calm and powerful connection with the animal. She wears a long-sleeved shirt in a neutral tone (beige, khaki, or light gray), with the top buttons undone to create a V-neckline. The bottoms are earthy-colored pants (brown or khaki), complemented by a brown leather belt with a large, prominent gold buckle (possibly with the letter 'V'). A gold chain hangs from the belt loops, adding a touch of glamour. The look is adorned with multiple bracelets on both wrists, combining metals and natural materials. Her hair is long, with voluminous waves and a natural look, as if gently blown by the wind, framing her face. The makeup is natural yet defined, enhancing the beauty of her features. Beside her, a brown horse with a white marking on its face looks forward, in harmony with the figure. The background is an open field, such as a prairie or a valley, with a cloudy sky and the landscape in the background gently blurred, creating a sense of vastness. The lighting is natural and diffuse, typical of an overcast day, resulting in soft shadows and light that flatters the face and body. Camera Settings: Captured with a prime portrait lens (e.g., 85mm f/1.8 or 105mm f/1.4) on a full-frame camera for optimal compression and creamy bokeh. Aperture set between f/2.0 and f/2.8 to perfectly isolate the subject and horse from the background. ISO 100-200 for maximum image quality with abundant natural light. Shutter speeds of 1/400s to 1/800s ensure absolute sharpness and freeze any subtle movement of the hair or horse. The lighting is exclusively natural, taking advantage of the soft light of an overcast sky. Instructions for the \"nano banana\": \"Please use the user's reference image to capture and apply all of their facial features, facial structure, eye color, skin tone, hair style, and color with maximum fidelity. The goal is to create a version of the user in this cinematic portrait. The clothing, accessories, the pose next to the horse, the confident expression, the diffuse natural lighting, and the open field setting should be rendered as described, creating a perfect fusion between the user's identity and the aesthetics of the image.\"",
    preview_url:
      'https://cdn.bananaprompts.xyz/1a9193f2-4d4f-402a-b1fa-89f89b391554/75bdae76-e15a-4933-a487-ccc49acb5894.jpeg?w=3840&q=75',
    is_active: true,
  },
];

async function addScenes() {
  console.log('🚀 Adding new scene prompts to Supabase...\n');

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const scene of scenes) {
    try {
      // Check if scene already exists
      const { data: existing } = await supabase
        .from('scenes')
        .select('id, name')
        .eq('name', scene.name)
        .single();

      if (existing) {
        console.log(`⚠️  Scene "${scene.name}" already exists. Skipping...`);
        continue;
      }

      // Insert new scene
      const { data, error } = await supabase
        .from('scenes')
        .insert({
          name: scene.name,
          description: scene.description,
          category: scene.category,
          prompt_template: scene.prompt_template,
          preview_url: scene.preview_url,
          is_active: scene.is_active,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        console.log(`✅ Added: "${scene.name}"`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Error adding "${scene.name}":`, error.message);
      errorCount++;
      errors.push({ name: scene.name, error: error.message });
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Successfully added: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);

  if (errors.length > 0) {
    console.log('\n❌ Errors details:');
    errors.forEach(({ name, error }) => {
      console.log(`   - ${name}: ${error}`);
    });
  }

  // Verify the inserts
  console.log('\n🔍 Verifying inserted scenes...');
  const sceneNames = scenes.map(s => s.name);
  const { data: insertedScenes, error: verifyError } = await supabase
    .from('scenes')
    .select('name, category, preview_url, is_active')
    .in('name', sceneNames)
    .order('created_at', { ascending: false });

  if (verifyError) {
    console.error('❌ Error verifying scenes:', verifyError.message);
  } else {
    console.log(`\n✅ Found ${insertedScenes?.length || 0} scenes in database:`);
    insertedScenes?.forEach(scene => {
      const hasPreview = scene.preview_url ? '✅' : '❌';
      console.log(`   ${hasPreview} ${scene.name} (${scene.category})`);
    });
  }
}

// Run the script
addScenes()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });

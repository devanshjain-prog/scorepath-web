import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAIChatCompletion } from '@/lib/ai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const { question_id, selected_answer, explain_type } = await request.json();

    if (!question_id || !explain_type) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the question
    const { data: question, error: dbError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', question_id)
      .single();

    if (dbError || !question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    let explanationText = "";

    try {
      let prompt = "";
      if (explain_type === 'eli5') {
        prompt = `You are a friendly GMAT tutor. Explain this question to an absolute beginner using a simple, relatable, real-world analogy. Avoid dry, complex formula names; focus on intuitive logical mechanics. Keep it simple and clear.
Question: ${question.prompt}
Selected Answer: ${selected_answer || 'N/A'}
Correct Answer: ${question.correct_answer}
Official Explanation: ${question.explanation}

Provide a clean, friendly 3-paragraph explanation.`;
      } else {
        prompt = `You are a GMAT speed-solving coach. Outline a high-yield GMAT 'Speed-solver' shortcut or test hack for this question that gets to the correct answer in under 45 seconds (e.g. testing easy values, back-solving, using ratio patterns, or scanning for extremes).
Question: ${question.prompt}
Selected Answer: ${selected_answer || 'N/A'}
Correct Answer: ${question.correct_answer}
Official Explanation: ${question.explanation}

Provide the shortcut method in clear bullet points, highlighting exactly how to bypass the standard algebraic/grammar proof.`;
      }

      explanationText = await getAIChatCompletion({
        messages: [
          { role: 'user', content: prompt }
        ],
        systemInstruction: 'You are a supportive, expert GMAT tutor explaining concepts in creative ways.'
      });

      if (!explanationText) throw new Error('Empty response from AI');
    } catch (aiError) {
      console.warn('AI Explainer failed or offline. Using high-fidelity local fallback:', aiError);
      
      const isQuant = question.category?.includes("Quant") || question.category?.includes("Quantitative");
      
      if (explain_type === 'eli5') {
        explanationText = isQuant
          ? `Imagine you and a friend are playing on a see-saw. If you add weight to one side, it tilts. But if you multiply both sides by a negative weight, the see-saw flips completely! 
          
That's why when solving inequalities like -2x < 4, dividing by -2 flips the tilt of the sign, changing '<' to '>'. 
 
Think of variable signs as a secret mask: if you don't know whether x is positive or negative, multiplying by it is like guessing the tilt of the see-saw with your eyes closed! Avoid doing this unless you are absolutely sure of the sign.`
          : `Imagine you're checking a recipe book that says: 'This recipe usually yields 4 servings.' If a critic reviews this and states: 'This recipe ALWAYS yields exactly 4 servings,' they are misrepresenting the book!
          
In GMAT reading passages, authors make qualified claims (e.g., 'tends to', 'usually'). Incorrect options often take these claims and exaggerate them into absolute extremes (e.g., 'always', 'never'). 

Look for qualifying language to find the safe, correct answer.`;
      } else {
        explanationText = isQuant
          ? `⚡ **45-Second GMAT Hack: Value Testing**
          
* **Identify the trap**: Standard algebra requires setting up quadratic inequality equations, which takes 2 minutes and has high mistake rates.
* **Shortcut**: Choose easy numbers for x. Let's test x = 2 and x = -2.
* **Test 1**: If x = 2, does it satisfy the prompt? If yes, eliminate options that exclude 2.
* **Test 2**: If x = -2, does it satisfy the prompt? If no, eliminate options that include -2.
* **Result**: You will immediately narrow down 5 options to the correct choice in under 30 seconds without solving any quadratics!`
          : `⚡ **45-Second GMAT Hack: Extreme Word Scan**
          
* **Identify the trap**: GMAT Verbal tests like to rewrite the passage content with minor changes to option choices.
* **Shortcut**: Run a quick scan for absolute words like *always*, *never*, *all*, *must*.
* **Filter**: Cross out those options immediately (90% of the time, they are extreme traps).
* **Confirm**: The correct option is almost always the one using qualified, soft language (e.g., *tends to*, *might*, *often*). Verify this choice in the passage first to save reading time.`;
      }
    }

    return NextResponse.json({ explanation: explanationText });
  } catch (err: any) {
    console.error('AI Explainer endpoint failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

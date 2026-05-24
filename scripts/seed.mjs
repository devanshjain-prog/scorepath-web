import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import Papa from 'papaparse';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding database from CSV...');
  const csvPath = path.resolve(__dirname, '../../scorepath_gmat_questions_repaired.csv');
  const csvFile = fs.readFileSync(csvPath, 'utf8');
  
  const parsed = Papa.parse(csvFile, { header: true, skipEmptyLines: true });
  const rows = parsed.data;

  const questionsToInsert = rows.map(row => {
    return {
      category: row.topic || row.section,
      difficulty: row.difficulty,
      prompt: row.question_text,
      options: [
        { id: 'A', text: row.option_a },
        { id: 'B', text: row.option_b },
        { id: 'C', text: row.option_c },
        { id: 'D', text: row.option_d },
        { id: 'E', text: row.option_e },
      ].filter(o => o.text),
      correct_answer: row.correct_answer,
      explanation: row.step_by_step_explanation || row.simple_explanation,
      tags: [row.skills_tested, row.formula_tags, row.method_tags, row.trap_type].filter(Boolean)
    };
  });

  const { data, error } = await supabase.from('questions').insert(questionsToInsert);

  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log(`Successfully inserted ${questionsToInsert.length} questions!`);
  }
}

seed();

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// List all forms
app.get('/api/forms', async (req, res) => {
  try {
    const forms = await prisma.form.findMany({
        orderBy: { createdAt: 'desc' }
    });
    res.json(forms.map(form => ({
        ...form,
        fields: JSON.parse(form.fields)
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Create a new form
app.post('/api/forms', async (req, res) => {
  try {
    const { title, description, fields } = req.body;
    const form = await prisma.form.create({
      data: {
        title,
        description,
        fields: JSON.stringify(fields) // stringify for sqlite
      }
    });
    // Send it back parsed for client convenience
    res.status(201).json({
        ...form,
        fields: JSON.parse(form.fields)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// Get a form by ID
app.get('/api/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const form = await prisma.form.findUnique({
      where: { id }
    });
    if (!form) return res.status(404).json({ error: 'Form not found' });
    
    res.json({
      ...form,
      fields: JSON.parse(form.fields)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// Submit a response
app.post('/api/forms/:id/responses', async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const response = await prisma.response.create({
      data: {
        formId: id,
        answers: JSON.stringify(answers)
      }
    });
    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

// Get responses for a form
app.get('/api/forms/:id/responses', async (req, res) => {
    try {
      const { id } = req.params;
      const responses = await prisma.response.findMany({
        where: { formId: id },
        orderBy: { createdAt: 'desc' }
      });
      res.json(responses.map(r => ({
          ...r,
          answers: JSON.parse(r.answers)
      })));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch responses' });
    }
  });

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

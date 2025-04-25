# Personal Statement Generator

This feature allows medical residency applicants to create personalized personal statements with the help of AI.

## Setup

### Backend Setup

1. Install the OpenAI package:
   ```
   cd backend
   npm install openai
   ```

2. Create a `.env` file in the backend directory with your OpenAI API key:
   ```
   # Add to existing .env file
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Frontend Setup

No additional setup is required for the frontend.

## Feature Flow

The personal statement generator follows a step-by-step wizard interface:

1. **Select Specialties**: User selects which medical specialties they're applying to.
2. **Specialty Reasoning**: User describes why they chose those specialties.
3. **Select Characteristics**: User selects 3 key characteristics they want to highlight.
4. **Experience 1**: User describes an experience demonstrating the first characteristic.
5. **Experience 2**: User describes an experience demonstrating the second characteristic.
6. **Experience 3**: User describes an experience demonstrating the third characteristic.
7. **Thesis Selection**: AI generates 5 thesis statements, and the user selects one.
8. **Preview Statement**: AI generates a complete personal statement for review.

## Technical Implementation

### Backend Components

- `openaiService.js`: Handles API calls to OpenAI
- `openaiController.js`: Contains endpoint logic
- `openaiRoutes.js`: Defines API routes

### Frontend Components

- `PersonalStatementWorkflow.jsx`: Main component that manages state and workflow
- `Specialties.jsx`: Step 1 - Select specialties
- `SpecialtyReason.jsx`: Step 2 - Describe specialty reasoning
- `CharacteristicsSelect.jsx`: Step 3 - Select characteristics
- `CharacteristicExperience.jsx`: Steps 4-6 - Describe experiences
- `ThesisSelection.jsx`: Step 7 - Select thesis statement
- `PersonalStatementPreview.jsx`: Step 8 - Preview and download

## API Endpoints

### Generate Thesis Statements

**POST /api/openai/thesis-statements**

Generates 5 thesis statements based on user inputs.

Request Body:
```json
{
  "specialties": ["Internal Medicine", "Family Medicine"],
  "reason": "I am passionate about primary care...",
  "characteristics": ["Compassion", "Analytical Thinking", "Resilience"],
  "experiences": [
    "During my rotation at...",
    "When I was conducting research on...",
    "While volunteering at..."
  ]
}
```

Response:
```json
{
  "success": true,
  "data": [
    "Thesis statement 1",
    "Thesis statement 2",
    "Thesis statement 3",
    "Thesis statement 4",
    "Thesis statement 5"
  ]
}
```

### Generate Personal Statement

**POST /api/openai/personal-statement**

Generates a complete personal statement based on user inputs and selected thesis.

Request Body:
```json
{
  "specialties": ["Internal Medicine", "Family Medicine"],
  "reason": "I am passionate about primary care...",
  "characteristics": ["Compassion", "Analytical Thinking", "Resilience"],
  "experiences": [
    "During my rotation at...",
    "When I was conducting research on...",
    "While volunteering at..."
  ],
  "selectedThesis": "With my unique combination of compassion and analytical thinking..."
}
```

Response:
```json
{
  "success": true,
  "data": "Complete personal statement text..."
}
```

## Word Count Limit

Personal statements are limited to 750 words to match typical residency application requirements. 
import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
export const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

export const fetchPortfolioData = async () => {
  try {
    const [aboutRes, skillsRes, projectsRes, eduRes] = await Promise.all([
      axios.get(`${baseUrl}/api/about/`),
      axios.get(`${baseUrl}/api/skills/`),
      axios.get(`${baseUrl}/api/projects/`),
      axios.get(`${baseUrl}/api/education/`),
    ]);
    
    return {
      aboutInfo: aboutRes.data,
      skills: skillsRes.data,
      projects: projectsRes.data,
      education: eduRes.data,
      error: null
    };
  } catch (err) {
    console.error("Error fetching data from API:", err);
    return {
      aboutInfo: null,
      skills: [],
      projects: [],
      education: [],
      error: err
    };
  }
};

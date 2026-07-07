import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
export const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

export const fetchAboutInfo = async () => {
  try {
    const res = await axios.get(`${baseUrl}/api/about/`);
    return res.data;
  } catch (err) {
    console.error("Error fetching about info:", err);
    throw err;
  }
};

export const fetchSkills = async () => {
  try {
    const res = await axios.get(`${baseUrl}/api/skills/`);
    return res.data;
  } catch (err) {
    console.error("Error fetching skills:", err);
    throw err;
  }
};

export const fetchProjects = async () => {
  try {
    const res = await axios.get(`${baseUrl}/api/projects/`);
    return res.data;
  } catch (err) {
    console.error("Error fetching projects:", err);
    throw err;
  }
};

export const fetchEducation = async () => {
  try {
    const res = await axios.get(`${baseUrl}/api/education/`);
    return res.data;
  } catch (err) {
    console.error("Error fetching education:", err);
    throw err;
  }
};

export const fetchPortfolioData = async () => {
  try {
    const res = await axios.get(`${baseUrl}/api/portfolio-data/`);
    return res.data;
  } catch (err) {
    console.error("Error fetching consolidated portfolio data:", err);
    throw err;
  }
};

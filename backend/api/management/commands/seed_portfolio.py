from django.core.management.base import BaseCommand
from api.models import AboutInfo, Skill, Project, Education

class Command(BaseCommand):
    help = 'Seeds the database with initial portfolio data'

    def handle(self, *args, **options):
        self.stdout.write('Clearing existing database records...')
        AboutInfo.objects.all().delete()
        Skill.objects.all().delete()
        Project.objects.all().delete()
        Education.objects.all().delete()

        # 1. Seed AboutInfo
        self.stdout.write('Seeding AboutInfo...')
        AboutInfo.objects.create(
            full_name="Logesh M",
            heading="I AM AVAILABLE FOR FULL STACK DEVELOPMENT",
            bio="Hi, I'm Logesh M. A passionate Full Stack Developer dedicated to creating visually appealing, accessible, and high-performance web applications. I specialize in React.js, Django, and PostgreSQL to build high-performance web systems.",
            projects_completed=20,
            years_experience=1,
            passion_percentage=100
        )

        # 2. Seed Skills
        self.stdout.write('Seeding Skills...')
        
        # Outer Circle nodes (Wheel)
        outer_skills = [
            ("React JS", "Outer", 90, "fab fa-react", "#61dafb", 0.0, 155.0, "Component-driven lifecycle, custom state hooks, and virtual rendering"),
            ("Python", "Outer", 90, "fab fa-python", "#3776ab", 72.0, 155.0, "Backend logic, web API design, scripting, and system algorithms"),
            ("Django", "Outer", 85, "fas fa-code", "#499d4a", 144.0, 155.0, "REST APIs, MVC pattern, schema designs, and middleware"),
            ("PostgreSQL", "Outer", 80, "fas fa-database", "#336791", 216.0, 155.0, "Relational database schemas, optimized SQL queries, and table locks"),
            ("Git", "Outer", 85, "fab fa-git-alt", "#f05032", 288.0, 155.0, "Version control, branching strategies, and repository management")
        ]
        
        # Inner Circle nodes (Wheel)
        inner_skills = [
            ("HTML5", "Inner", 95, "fab fa-html5", "#e34f26", 45.0, 100.0, "Semantic, accessible, and structured web layouts"),
            ("CSS3", "Inner", 90, "fab fa-css3-alt", "#1572b6", 135.0, 100.0, "Responsive grids, flexboxes, variables, and GPU animations"),
            ("JavaScript", "Inner", 85, "fab fa-js", "#f7df1e", 225.0, 100.0, "DOM mechanics, ES6 module scopes, and asynchronous fetching"),
            ("GitHub", "Inner", 85, "fab fa-github", "#ffffff", 315.0, 100.0, "Remote workflow, review cycles, and actions pipelines")
        ]

        for s in outer_skills:
            Skill.objects.create(
                name=s[0], category=s[1], level=s[2], icon_class=s[3],
                icon_color=s[4], angle=s[5], radius=s[6], description=s[7]
            )

        for s in inner_skills:
            Skill.objects.create(
                name=s[0], category=s[1], level=s[2], icon_class=s[3],
                icon_color=s[4], angle=s[5], radius=s[6], description=s[7]
            )

        # 3. Seed Projects
        self.stdout.write('Seeding Projects...')
        projects = [
            {
                "title": "Smart Life Analyzer",
                "description": "A premium analyzer incorporating daily mood mapping, journal entries, expense logs, visual health indexes, and AI-driven behavior insights.",
                "tags": "React, Django, PostgreSQL, AI Integration",
                "features": "Mood, Expense, Health, AI",
                "techs_used": "Django, React, PG, AI",
                "status": "Completed",
                "live_url": "https://demo.logesh.dev/analyzer",
                "github_url": "https://github.com/logesh/smart-life-analyzer",
                "is_featured": True,
                "order": 1
            },
            {
                "title": "Portfolio Website",
                "description": "A premium developer portfolio featuring rich space aesthetics, interactive canvas stars, custom clip-path sidebars, and smooth layouts.",
                "tags": "HTML5, CSS3, JavaScript, Glassmorphism",
                "features": "Interactive UI, Canvas, Timelines",
                "techs_used": "HTML, CSS, JS, Canvas",
                "status": "Completed",
                "live_url": "https://logesh.dev",
                "github_url": "https://github.com/logesh/portfolio",
                "is_featured": False,
                "order": 2
            },
            {
                "title": "Weather App",
                "description": "A high-performance weather forecasting application that pulls real-time weather analytics and renders cinematic, weather-matching background gradients.",
                "tags": "React JS, OpenWeather API, CSS Grid",
                "features": "Search, Forecast, Dynamic BG",
                "techs_used": "React, REST API, Vanilla CSS",
                "status": "Completed",
                "live_url": "https://demo.logesh.dev/weather",
                "github_url": "https://github.com/logesh/weather-app",
                "is_featured": False,
                "order": 3
            },
            {
                "title": "Expense Tracker",
                "description": "An analytics-heavy financial app featuring customizable budget limits, smart category breakdowns, and reactive data table dashboards.",
                "tags": "React JS, Django, PostgreSQL",
                "features": "Limit Checks, Charts, Filters",
                "techs_used": "Django, React, PG, Chart.js",
                "status": "In Progress",
                "live_url": "https://demo.logesh.dev/finance",
                "github_url": "https://github.com/logesh/expense-tracker",
                "is_featured": False,
                "order": 4
            }
        ]

        for p in projects:
            Project.objects.create(**p)

        # 4. Seed Education Timeline
        self.stdout.write('Seeding Education Timeline...')
        timeline = [
            {
                "year_range": "2023 - 2025",
                "title": "M.Sc Computer Science",
                "institution": "Periyar University",
                "grade": "6.5 CGPA",
                "grade_label": "Graduation Index",
                "progress_offset": 35.19
            },
            {
                "year_range": "2020 - 2023",
                "title": "B.Sc Information Technology",
                "institution": "Karpagam University",
                "grade": "7.79 CGPA",
                "grade_label": "Graduation Index",
                "progress_offset": 25.13
            },
            {
                "year_range": "2019 - 2020",
                "title": "Higher Secondary (12th)",
                "institution": "State Board Academy",
                "grade": "67%",
                "grade_label": "Graduation Index",
                "progress_offset": 15.08
            },
            {
                "year_range": "2017 - 2018",
                "title": "Secondary School (10th)",
                "institution": "State Board Academy",
                "grade": "86%",
                "grade_label": "Graduation Index",
                "progress_offset": 10.05
            }
        ]

        for item in timeline:
            Education.objects.create(**item)

        self.stdout.write(self.style.SUCCESS('Successfully seeded all portfolio databases!'))

import React from 'react';
import { motion } from 'framer-motion';

const Skills: React.FC = () => {
  const skillCategories = [
    {
      title: "LLMs & Gen AI",
      skills: [
        { name: "LangChain", level: 95 },
        { name: "LangGraph", level: 90 },
        { name: "Crew AI", level: 88 },
        { name: "OpenAI API", level: 92 },
        { name: "Agentic Workflows", level: 85 }
      ]
    },
    {
      title: "ML & Deep Learning",
      skills: [
        { name: "PyTorch", level: 90 },
        { name: "TensorFlow", level: 85 },
        { name: "Scikit-learn", level: 95 },
        { name: "Transformers", level: 88 },
        { name: "OpenCV", level: 82 }
      ]
    },
    {
      title: "MLOps & Tools",
      skills: [
        { name: "MLflow", level: 85 },
        { name: "Docker", level: 88 },
        { name: "Kubernetes", level: 80 },
        { name: "AWS/GCP", level: 85 },
        { name: "Git/DVC", level: 95 }
      ]
    }
  ];

  const technologies = [
    "React", "TypeScript", "Node.js", "Python", "AWS", "Docker", 
    "PostgreSQL", "MongoDB", "GraphQL", "Tailwind", "Next.js", "Vercel"
  ];

  return (
    <section id="skills" className="py-20 bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-50">
              My <span className="text-violet-400">Skills</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              A comprehensive toolkit built through years of hands-on experience 
              and continuous learning in the ever-evolving tech landscape.
            </p>
          </div>

          {/* Skill Progress Bars */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {skillCategories.map((category, index) => (
              <motion.div 
                key={index} 
                className="bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-violet-500/10 border border-slate-700 transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="text-2xl font-bold mb-6 text-slate-100">{category.title}</h3>
                <div className="space-y-5">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skillIndex}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-slate-300">{skill.name}</span>
                        <span className="text-violet-400 font-medium">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div 
                          className="bg-violet-500 h-2.5 rounded-full"
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Technology Tags */}
          <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-center text-slate-100">Technologies I Work With</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {technologies.map((tech, index) => (
                <span 
                  key={index}
                  className="px-5 py-2 bg-slate-700 text-slate-300 rounded-full font-medium hover:bg-violet-500 hover:text-white transition-all duration-300 cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
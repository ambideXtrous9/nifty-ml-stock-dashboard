import React from 'react';
import { ExternalLink, Github } from 'lucide-react';
import { motion } from 'framer-motion';

const Projects: React.FC = () => {
  const projects = [
    {
      title: "Streamlit AI Portfolio",
      description: "Interactive AI portfolio application showcasing machine learning projects and capabilities with modern UI/UX design.",
      image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800",
      technologies: ["Streamlit", "Python", "AI/ML"],
      github: "#",
      live: "#",
      featured: true
    },
    {
      title: "Bengali News Summarization",
      description: "Advanced text summarization system using BengaliGPT & T5 models for processing Bengali news articles with high accuracy.",
      image: "https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=800",
      technologies: ["BengaliGPT", "T5", "NLP", "Python"],
      github: "#",
      live: "#",
      featured: true
    },
    {
      title: "Brand Logo Classification",
      description: "Transfer learning implementation using MobileNetV2 for logo classification with incremental learning capabilities on Flickr27 dataset.",
      image: "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=800",
      technologies: ["MobileNetV2", "Transfer Learning", "Computer Vision"],
      github: "#",
      live: "#",
      featured: true
    },
    {
      title: "Finetune Qwen3 using Unsloth",
      description: "Advanced LLM fine-tuning project using Unsloth framework for reasoning and non-reasoning datasets with optimized performance.",
      image: "https://images.pexels.com/photos/8386422/pexels-photo-8386422.jpeg?auto=compress&cs=tinysrgb&w=800",
      technologies: ["Qwen3", "Unsloth", "LLM", "Fine-tuning"],
      github: "#",
      live: "#",
      featured: false
    },
    {
      title: "600+ DSA Problems",
      description: "Comprehensive collection of 600+ Data Structures and Algorithms problems solved from GFG, LeetCode, and BinarySearch platforms.",
      image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800",
      technologies: ["C++", "Algorithms", "Data Structures"],
      github: "#",
      live: "#",
      featured: false
    },
    {
      title: "News Article QA System",
      description: "MTP project implementing FlanT5-SBERT model for NewsQA with Teacher-Student architecture for enhanced question answering.",
      image: "https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=800",
      technologies: ["FlanT5", "SBERT", "Question Answering", "NLP"],
      github: "#",
      live: "#",
      featured: false
    }
  ];

  const featuredProjects = projects.filter(project => project.featured);

  return (
    <section id="projects" className="py-20 bg-slate-800">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-50 mb-6">Projects</h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              A showcase of my recent AI/ML work, demonstrating expertise across different 
              technologies and problem domains.
            </p>
          </div>

          {/* Featured Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {featuredProjects.map((project, index) => (
              <motion.div 
                key={index} 
                className="group bg-slate-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300 border border-slate-700"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <a href={project.github} className="p-2 bg-slate-700/80 rounded-full hover:bg-violet-500 transition-colors text-slate-100">
                      <Github className="w-4 h-4" />
                    </a>
                    <a href={project.live} className="p-2 bg-slate-700/80 rounded-full hover:bg-violet-500 transition-colors text-slate-100">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-slate-100 group-hover:text-violet-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-slate-400 mb-4 leading-relaxed text-sm">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-medium border border-slate-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* All Projects Button */}
          <div className="text-center">
            <button className="bg-violet-600 text-white px-8 py-4 rounded-md hover:bg-violet-700 transition-all duration-300 font-medium">
              View All Projects
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
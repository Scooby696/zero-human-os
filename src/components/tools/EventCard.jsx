import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, ExternalLink } from "lucide-react";

const levelColor = {
  Beginner: "text-green-400 bg-green-400/10 border-green-400/20",
  Intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

export default function EventCard({ event, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {event.type}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${levelColor[event.level]}`}>
              {event.level}
            </span>
          </div>
          <h3 className="text-base font-bold text-foreground mt-2">{event.title}</h3>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{event.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <span className="font-medium text-foreground">{event.date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <span>{event.time} (Local Time)</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-foreground">{event.venue}</span>
            <br />
            <span className="text-xs">{event.address}</span>
          </div>
        </div>
      </div>

      <a
        href={event.mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <MapPin className="w-3.5 h-3.5" />
        Open in Google Maps
        <ExternalLink className="w-3 h-3" />
      </a>
    </motion.div>
  );
}
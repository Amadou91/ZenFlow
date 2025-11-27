import React from 'react';
import { Activity, Anchor, Moon, RefreshCw, Sun, Target, User, Zap } from 'lucide-react';
import { POSE_CATEGORIES } from '../data/poses';

const PoseIcon = ({ category, className = 'w-full h-full p-2' }) => {
  let Icon = User;
  switch (category) {
    case POSE_CATEGORIES.SUN_SALUTATION:
      Icon = Sun;
      break;
    case POSE_CATEGORIES.WARMUP:
      Icon = Activity;
      break;
    case POSE_CATEGORIES.CENTERING:
      Icon = Anchor;
      break;
    case POSE_CATEGORIES.STANDING:
      Icon = User;
      break;
    case POSE_CATEGORIES.BALANCE:
      Icon = Target;
      break;
    case POSE_CATEGORIES.CORE:
      Icon = Zap;
      break;
    case POSE_CATEGORIES.BACKBEND:
      Icon = Activity;
      break;
    case POSE_CATEGORIES.TWIST:
      Icon = RefreshCw;
      break;
    case POSE_CATEGORIES.HIP_OPENER:
      Icon = Target;
      break;
    case POSE_CATEGORIES.RESTORATIVE:
      Icon = Anchor;
      break;
    case POSE_CATEGORIES.SAVASANA:
      Icon = Moon;
      break;
    case POSE_CATEGORIES.INVERSION:
      Icon = RefreshCw;
      break;
    default:
      Icon = User;
  }
  return <Icon className={className} strokeWidth={1.5} />;
};

export default PoseIcon;

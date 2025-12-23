---
author: Karun Japhet
comments: true
date: 2013-12-03 05:52:13+00:00
layout: post
slug: eclipse-plugin-development-project-icon-overlay
title: 'Eclipse Plugin Development: Project Icon Overlay'
description: "Fix Eclipse custom project icons by prioritizing nature IDs. Learn how to ensure your custom icon appears instead of Java's default."
wordpress_id: 489
category: Software Design
tags:
  - ide
  - eclipse
  - plugin-development
  - java
---

If you're trying to create a Custom Project in Eclipse, you'll eventually come to read a beautiful blog post over at [Hidden Clause](http://cvalcarcel.wordpress.com/2009/10/14/writing-an-eclipse-plug-in-part-6-adding-an-icon-to-new-project-types/) that documents quite well how to overlay your icon over Eclipse's default folder icon to get the icon of your choice.

If you're default project is an extension of an already existing project (I, for example, wanted a custom Java Project type so I extended Eclipse's New Java project wizard to get desired effect), the default nature added is that of Java meaning Eclipse adds it's icon and not the icon you've set up. The issue isn't even in the step you've just followed to add the icon. The issue was inadvertenly induced in the last step while adding your custom project nature with code which looks something like this (reference code from [Hidden Clause](http://cvalcarcel.wordpress.com/2009/07/26/writing-an-eclipse-plug-in-part-4-create-a-custom-project-in-eclipse-new-project-wizard-the-behavior/))

    
    private static void addNature(IProject project) throws CoreException {
        if (!project.hasNature(ProjectNature.NATURE_ID)) {
            IProjectDescription description = project.getDescription();
            String[] prevNatures = description.getNatureIds();
            String[] newNatures = new String[prevNatures.length + 1];
            System.arraycopy(prevNatures, 0, newNatures, 0, prevNatures.length);
            newNatures[prevNatures.length] = ProjectNature.NATURE_ID;
            description.setNatureIds(newNatures);
    
            IProgressMonitor monitor = null;
            project.setDescription(description, monitor);
        }
    }


This can be remedied easily by ensuring your nature ID is added before that of your predecessors. Eclipse only applies the icon from one nature, not multiple ones. Here's the code I ended up with

    
    final IProjectDescription description = project.getDescription();
    final List natures = new ArrayList<>(Arrays.asList(description.getNatureIds()));
    natures.add(0, Database.NATURE_ID);
    final String[] newNatures = natures.toArray(new String[natures.size()]);
    final IStatus status = ResourcesPlugin.getWorkspace().validateNatureSet(newNatures);
    
    // check the status and decide what to do
    if (status.getCode() == IStatus.OK) {
        description.setNatureIds(newNatures);
        project.setDescription(description, null);
    } else {
        // raise a user error
    }


Next up, now to make the icon be used completely and not as a simple overlay..

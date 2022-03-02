import {Project} from '@models/appconfig';

export interface ProjectNameChange {
  newName: string;
}

export enum StorePropagation {
  ChangeProjectName = 1,
}

interface GlobalElectronStoreEvent<T> {
  eventType: StorePropagation;
  payload: T;
}

interface ActionResult<T> {
  shouldTriggerAcrossWindows: boolean;
  eventData?: GlobalElectronStoreEvent<T>;
}

interface ElectronStoreChangePropagate<P, T> {
  keyName: string;
  action: (oldData: P, newData: P) => ActionResult<T>;
}

const projectNameChange: ElectronStoreChangePropagate<Project[], ProjectNameChange> = {
  keyName: 'appConfig.projects',
  action: (newProjects, oldProjects) => {
    const triggeredForProject = newProjects
      .find((project, index) => project.name !== oldProjects[index].name);
    if (!triggeredForProject) {
      return { shouldTriggerAcrossWindows: false };
    }

    return {
      shouldTriggerAcrossWindows: true,
      eventData: {
        eventType: StorePropagation.ChangeProjectName,
        payload: {
          newName: triggeredForProject.name as string,
        },
      },
    };
  },
};

export const globalElectronStoreChanges: ElectronStoreChangePropagate<any, any>[] = [
  projectNameChange,
];

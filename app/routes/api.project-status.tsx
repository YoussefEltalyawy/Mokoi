import {json} from '@shopify/remix-oxygen';

export async function loader() {
  try {
    const response = await fetch(
      'https://talyawy-control-panel.vercel.app/api/project-status?id=7e0ccc0d-887b-45e7-8f42-33e572f19af1',
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error('Error in project status API route:', error);
    return json(
      {status: 'error', message: 'Failed to fetch project status'},
      {status: 500},
    );
  }
}

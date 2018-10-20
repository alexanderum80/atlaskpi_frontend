import { title } from 'change-case';
import gql from 'graphql-tag';


export const KpisQuery = gql `
    query {
        kpis {
            _id
            name
            groupingInfo {
                value
                name
            }
            type
        }
    }
`;

export const allKpisWithData = gql `
    query {
        getAllKPIs {
            _id
            name
            groupingInfo {
                value
                name
            }
            type
        }
    }
`;

export const PreviewChartQuery = gql `
    query ($input: ChartAttributesInput!) {
        previewChart(input: $input)
    }
`;




export const ListChartQuery = gql `
query ListChartQuery {
    listCharts {
      data {
        _id
        title
        frequency
        groupings
        xAxisSource
        dateRange {
          predefined
            custom {
              from
              to
            }
          }
        }
    }
}
`;

export const SingleChartQuery = gql `
    query ($id: String) {
      chart(id: $id)
    }
`;

export const SingleMapQuery = gql `
    query ($id: String) {
      map(id: $id)
    }
`;
export const CreateChartMutation = gql `
    mutation ($input: ChartAttributesInput!) {
        createChart(input: $input) {
            success
            entity {
                _id
            }
            errors {
                field
                errors
            }
        }
    }
`;
export const CreateMapMutation = gql `
    mutation ($input: MapAttributesInput!) {
        createMap(input: $input) {
            success
            entity {
                title
            }
            errors {
                field
                errors
            }
        }
    }
`;
export const DeleteChartMutation = gql `
    mutation ($id: String!) {
      deleteChart(id: $id) {
        success
        errors {
            field
            errors
        }
      }
    }
`;
export const DeleteMapMutation = gql `
    mutation ($id: String!) {
      deleteMap(id: $id) {
        success
        errors {
            field
            errors
        }
      }
    }
`;

export const UpdateChartMutation = gql `
    mutation ($id: String!, $input: ChartAttributesInput!) {
        updateChart(id: $id, input: $input) {
            success
            errors {
                field
                errors
            }
        }
    }
`;
export const UpdateMapMutation = gql `
    mutation ($id: String!, $input: MapAttributesInput!) {
        updateMap(id: $id, input: $input) {
            success
            errors {
                field
                errors
            }
        }
    }
`;


export const drillDownQuery = gql `
    query DrillDown($id: String, $data: DrillDownData) {
        drillDown(id: $id, data: $data)
    }
`;

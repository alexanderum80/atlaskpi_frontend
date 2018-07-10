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


export const drillDownQuery = gql `
    query DrillDown($id: String, $data: DrillDownData) {
        drillDown(id: $id, data: $data)
    }
`;

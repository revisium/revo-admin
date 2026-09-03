import { Box, createToaster, Text, Toaster as ChakraToaster } from '@chakra-ui/react'

export const toaster = createToaster({
  placement: 'top-end',
})

export const Toaster = () => (
  <ChakraToaster toaster={toaster}>
    {(toast) => (
      <Box
        bg="bg.surface"
        borderWidth="1px"
        borderColor="border.strong"
        borderRadius="card"
        px="4"
        py="3"
        boxShadow="dialog"
      >
        <Text textStyle="body" color="fg.default">
          {toast.title}
        </Text>
        {toast.description ? (
          <Text textStyle="caption" color="fg.secondary">
            {toast.description}
          </Text>
        ) : null}
      </Box>
    )}
  </ChakraToaster>
)
